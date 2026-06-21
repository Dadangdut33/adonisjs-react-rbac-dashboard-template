'use client'

import type { AllowedImageTags } from '#validators/media'

import { Skeleton } from '@mantine/core'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { Table } from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import TextAlign from '@tiptap/extension-text-align'
import { EditorContent, useEditor } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import { isString } from 'lodash-es'
import { AlertCircle, Check, Eye, EyeOff, Loader, X } from 'lucide-react'
import { NodeSelection, type Selection } from 'prosemirror-state'
import type React from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Toolbar, ToolbarGroup } from '~/components/tiptap-ui-primitive/toolbar'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
import { useIsReady } from '~/hooks/use_is_ready'
import { sanitizeTiptapContent } from '~/lib/rte_content'
import { cn } from '~/lib/utils'

import { lowlight } from './code_languages'
import AlertDialogButton from './components/alert/alert-dialog-button'
import AudioDialogButton from './components/audio/audio-dialog-button'
import ExcalidrawDialogButton from './components/excalidraw/excalidraw-dialog-button'
import FileDialogButton from './components/file/file-dialog-button'
import GridDialogButton from './components/grid/grid-dialog-button'
import ImageBubbleMenu from './components/image/image-bubble-menu'
import ImageDialogButton from './components/image/image-dialog-button'
import ImageResizePopover from './components/image/image-resize-popover'
import LinkDialogButton from './components/link/link-dialog-button'
import TableBubbleMenu from './components/table/tabble-bubble-menu'
import TableInsertDialogButton from './components/table/table-insert-dialog-button'
import TableOperationsDropdown from './components/table/table-operations-dropdown'
import TextBubbleMenu from './components/text/text-bubble-menu'
import UploadStatusPanel, { type UploadTask } from './components/upload/upload-status-panel'
import UtilsBubbleMenu from './components/utils-bubble-menu'
import VideoDialogButton from './components/video/video-dialog-button'
import YoutubeDialogButton from './components/youtube/youtube-dialog-button'
import AlertBlock from './extensions/alert-block'
import AudioAttachment from './extensions/audio-attachment'
import CustomCodeBlockLowlight from './extensions/code-block-lowlight'
import ExcalidrawBlock from './extensions/excalidraw-block'
import FileAttachment from './extensions/file-attachment'
import GridBlock from './extensions/grid-block'
import LinkCard from './extensions/link-card'
import ResizableImage from './extensions/resizeable-image'
import TextColor from './extensions/text-color'
import VideoAttachment from './extensions/video-attachment'
import YoutubeEmbed from './extensions/youtube-embed'
import useAudioUpload from './hooks/use_audio_upload'
import useEmbedActions from './hooks/use_embed_actions'
import useFileUpload from './hooks/use_file_upload'
import useImageUpload from './hooks/use_image_upload'
import useStickyToolbar from './hooks/use_sticky_toolbar'
import useTableActions from './hooks/use_table_actions'
import useVideoUpload from './hooks/use_video_upload'
import MediaLibraryDialog from './media-library-dialog'
import { SelectedImageType } from './types'

const isTableNodeName = (name: string) =>
  name === 'table' || name === 'tableRow' || name === 'tableCell' || name === 'tableHeader'

export interface TiptapEditorProps {
  content?: string | object
  onSave?: (content: object) => void
  onError?: (error: string) => void
  placeholder?: string
  className?: string
  toolbarClassName?: string
  editorClassName?: string
  readOnly?: boolean
  stickyToolbar?: boolean
  imageTags?: AllowedImageTags[] // image tags when upload to media library
  getMediaURL?: string // URL to fetch media library
  uploadMediaURL?: string // URL to upload images
  deleteMediaURL?: string // URL to delete images
  ssr?: boolean // Server-side rendering support
  onRendered?: (container: HTMLDivElement | null) => void
}

export default function TiptapEditor({
  content = '',
  onSave,
  onError,
  placeholder = 'Start writing your blog post...',
  className,
  toolbarClassName,
  editorClassName,
  readOnly = false,
  stickyToolbar = true,
  getMediaURL,
  uploadMediaURL,
  deleteMediaURL,
  ssr: SSR = true, // Server-side rendering support
  imageTags = [],
  onRendered,
}: TiptapEditorProps) {
  const isReady = useIsReady()
  const [error, setError] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false)
  const [mediaLibrarySelectType, setMediaLibrarySelectType] = useState<
    'image' | 'file' | 'audio' | 'video'
  >('image')
  const [stickyToolbarLayout, setStickyToolbarLayout] = useState<{
    left: number
    width: number
  } | null>(null)
  const [selectedImage, setSelectedImage] = useState<SelectedImageType>(null)
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true)
  const [aspectRatio, setAspectRatio] = useState(1)
  const [isInTableContext, setIsInTableContext] = useState(false)

  const toolbarRef = useRef<HTMLDivElement>(null)
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const editorContentRef = useRef<HTMLDivElement>(null)
  const hasNotifiedRenderedRef = useRef(false)
  const isResizingRef = useRef(false)
  const [resizePopoverOpen, setResizePopoverOpen] = useState(false)

  const handleImageSelect = useCallback(
    (attrs: { pos: number; src: string; width: number; height: number }) => {
      setSelectedImage(attrs)
      setAspectRatio(attrs.width / attrs.height)
      setResizePopoverOpen(true) // Auto-open the resize popover
    },
    []
  )

  const handleImageDeselect = useCallback(() => {
    // Only deselect if we're not currently resizing and popover is closed
    if (!isResizingRef.current && !resizePopoverOpen) {
      setSelectedImage(null)
    }
  }, [resizePopoverOpen])

  // Initialize the editor with enhanced extensions
  const editor = useEditor({
    immediatelyRender: SSR ? false : true,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        link: false,
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      LinkCard,
      YoutubeEmbed,
      AlertBlock,
      GridBlock,
      ExcalidrawBlock,
      TextColor,
      AudioAttachment,
      VideoAttachment,
      FileAttachment,
      CustomCodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'plaintext',
        enableTabIndentation: true,
        tabSize: 2,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      // Replace standard Image with ResizableImage
      ResizableImage.configure({
        HTMLAttributes: {
          class: 'rounded-md my-4',
        },
        onSelect: handleImageSelect,
        onDeselect: handleImageDeselect,
      }),
      Placeholder.configure({
        placeholder,
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full my-4',
        },
      }),
      TableRow,
      TableHeader,
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-border p-2',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'], // Remove image from types
        alignments: ['left', 'center', 'right', 'justify'],
        defaultAlignment: 'left',
      }),
    ],
    content: content,
    editable: readOnly ? false : !isPreviewMode,
    onUpdate: () => {
      // on first load might not have editor yet, so we can ignore
      if (!isReady) return

      saveContent()
      // Clear any previous errors when the content changes
      if (error) setError(null)
    },
  })

  const {
    linkUrl,
    setLinkUrl,
    isFetchingLinkMetadata,
    linkMetadata,
    linkMetadataError,
    setLink,
    fetchLinkMetadata,
    youtubeUrl,
    setYoutubeUrl,
    isFetchingYoutubeMetadata,
    youtubeMetadata,
    youtubeMetadataError,
    fetchYoutubeMetadata,
    addYoutubeEmbed,
  } = useEmbedActions(editor)

  useEffect(() => {
    if (!editor) return

    editor.setEditable(readOnly ? false : !isPreviewMode)
    // Force a transaction so React node views can re-evaluate `editor.isEditable`.
    editor.view.dispatch(editor.state.tr.setMeta('rte:editable-changed', Date.now()))
  }, [editor, readOnly, isPreviewMode])

  const isTableContext = useCallback(() => {
    if (!editor) return false

    const selection = editor.state.selection

    // CellSelection (selecting one/multiple table cells) should use table actions.
    const isCellSelection =
      '$anchorCell' in (selection as Selection) && '$headCell' in (selection as Selection)
    if (isCellSelection) {
      return true
    }

    // If user is selecting text range, prefer text bubble actions.
    if (!selection.empty && !(selection instanceof NodeSelection)) {
      return false
    }

    if (selection instanceof NodeSelection) {
      const nodeName = selection.node.type.name
      if (isTableNodeName(nodeName)) {
        return true
      }
    }

    const from = selection.$from
    for (let depth = from.depth; depth >= 0; depth--) {
      const nodeName = from.node(depth).type.name
      if (isTableNodeName(nodeName)) {
        return true
      }
    }

    if (
      editor.isActive('table') ||
      editor.isActive('tableCell') ||
      editor.isActive('tableHeader') ||
      editor.isActive('tableRow')
    ) {
      return true
    }

    return false
  }, [editor])

  useEffect(() => {
    if (!editor) return

    const syncTableContext = () => {
      setIsInTableContext(isTableContext())
    }

    syncTableContext()
    editor.on('selectionUpdate', syncTableContext)
    editor.on('transaction', syncTableContext)

    return () => {
      editor.off('selectionUpdate', syncTableContext)
      editor.off('transaction', syncTableContext)
    }
  }, [editor, isTableContext])

  const runOnSelectedImage = useCallback(
    (fn: () => void) => {
      if (!editor || !selectedImage) return

      const selected = editor.chain().focus().setNodeSelection(selectedImage.pos).run()
      if (!selected) return
      fn()
    },
    [editor, selectedImage]
  )

  const handleSliderMouseDown = useCallback((e: React.MouseEvent) => {
    // Prevent the editor from losing focus when interacting with sliders
    e.preventDefault()
    isResizingRef.current = true
    setResizePopoverOpen(true) // Keep the popover open during resize
  }, [])

  const handleSliderMouseUp = useCallback(() => {
    setTimeout(() => {
      isResizingRef.current = false
      // Don't close the popover when releasing the slider
    }, 100)
  }, [])

  const {
    tableDialogOpen,
    setTableDialogOpen,
    rows,
    setRows,
    cols,
    setCols,
    withHeaderRow,
    setWithHeaderRow,
    insertTable,
    addColumnBefore,
    addColumnAfter,
    deleteColumn,
    addRowBefore,
    addRowAfter,
    deleteRow,
    deleteTable,
    mergeOrSplitCells,
  } = useTableActions(editor)

  const {
    isUploading,
    uploadProgress,
    fileInputRef,
    handleFileUpload,
    handleFileInputChange,
    handleDrop,
    handleDragOver,
  } = useImageUpload({
    editor,
    setError,
    onError,
    uploadMediaURL,
    imageTags,
    readOnly: !editor?.isEditable,
  })

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      if (readOnly || !editor?.isEditable) return

      const fileImages = Array.from(e.clipboardData?.files || []).filter((file) =>
        file.type.startsWith('image/')
      )

      let imageFile = fileImages[0]
      if (!imageFile) {
        const imageItem = Array.from(e.clipboardData?.items || []).find((item) =>
          item.type.startsWith('image/')
        )
        // @ts-ignore
        imageFile = imageItem?.getAsFile() || undefined
      }

      if (!imageFile) return

      e.preventDefault()
      handleFileUpload(imageFile)
    },
    [editor, handleFileUpload, readOnly]
  )

  const {
    isUploadingFile,
    fileUploadProgress,
    fileInputRef: fileUploadInputRef,
    handleFileUpload: handleGenericFileUpload,
    handleInsertFromUrl: handleInsertFileFromUrl,
    handleFileInputChange: handleFileUploadInputChange,
  } = useFileUpload({
    editor,
    setError,
    onError,
    uploadMediaURL,
    tags: imageTags,
  })

  const {
    isUploadingAudio,
    audioUploadProgress,
    audioInputRef,
    handleAudioUpload,
    handleAudioInputChange,
    handleInsertFromUrl: handleInsertAudioFromUrl,
  } = useAudioUpload({
    editor,
    setError,
    onError,
    uploadMediaURL,
    tags: imageTags,
  })

  const {
    isUploadingVideo,
    videoUploadProgress,
    videoInputRef,
    handleVideoUpload,
    handleVideoInputChange,
    handleInsertFromUrl: handleInsertVideoFromUrl,
  } = useVideoUpload({
    editor,
    setError,
    onError,
    uploadMediaURL,
    tags: imageTags,
  })

  const { isToolbarSticky } = useStickyToolbar({
    stickyToolbar,
    readOnly,
    toolbarRef,
    editorContainerRef,
    editorContentRef,
  })

  useEffect(() => {
    if (!isToolbarSticky || !editorContainerRef.current) {
      setStickyToolbarLayout(null)
      return
    }

    const syncStickyLayout = () => {
      const container = editorContainerRef.current
      if (!container) return
      const rect = container.getBoundingClientRect()
      setStickyToolbarLayout({
        left: rect.left,
        width: rect.width,
      })
    }

    const resizeObserver = new ResizeObserver(syncStickyLayout)
    resizeObserver.observe(editorContainerRef.current)

    syncStickyLayout()
    window.addEventListener('resize', syncStickyLayout)
    window.addEventListener('scroll', syncStickyLayout, { passive: true })

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', syncStickyLayout)
      window.removeEventListener('scroll', syncStickyLayout)
    }
  }, [isToolbarSticky])

  const stickyToolbarStyle = useMemo(() => {
    if (!isToolbarSticky || !stickyToolbarLayout) return undefined
    return {
      left: `${stickyToolbarLayout.left}px`,
      width: `${stickyToolbarLayout.width}px`,
    }
  }, [isToolbarSticky, stickyToolbarLayout])

  const activeUploads = useMemo<UploadTask[]>(() => {
    const tasks: UploadTask[] = []
    if (isUploading) tasks.push({ id: 'image', progress: uploadProgress })
    if (isUploadingFile) tasks.push({ id: 'file', progress: fileUploadProgress })
    if (isUploadingAudio) tasks.push({ id: 'audio', progress: audioUploadProgress })
    if (isUploadingVideo) tasks.push({ id: 'video', progress: videoUploadProgress })
    return tasks
  }, [
    isUploading,
    uploadProgress,
    isUploadingFile,
    fileUploadProgress,
    isUploadingAudio,
    audioUploadProgress,
    isUploadingVideo,
    videoUploadProgress,
  ])

  // Load initial content
  useEffect(() => {
    if (editor && content) {
      setIsLoading(true)
      try {
        if (isString(content)) {
          // Try to parse as JSON
          try {
            const parsedContent = JSON.parse(content)
            editor.commands.setContent(sanitizeTiptapContent(parsedContent))
          } catch (e) {
            // If not valid JSON, set as HTML
            editor.commands.setContent(content)
          }
        } else {
          // If object, set directly
          editor.commands.setContent(sanitizeTiptapContent(content))
        }
      } catch (err) {
        const errorMessage = 'Failed to load content into the editor'
        setError(errorMessage)
        if (onError) onError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }
  }, [editor, onError])

  useEffect(() => {
    hasNotifiedRenderedRef.current = false
  }, [content])

  useEffect(() => {
    if (!editor || isLoading || !onRendered || hasNotifiedRenderedRef.current) return

    hasNotifiedRenderedRef.current = true
    const raf = window.requestAnimationFrame(() => {
      onRendered(editorContentRef.current)
    })

    return () => window.cancelAnimationFrame(raf)
  }, [editor, isLoading, onRendered, content])

  // Handle saving content
  const saveContent = useCallback(() => {
    if (!editor) return

    setIsSaving(true)
    try {
      const json = sanitizeTiptapContent(editor.getJSON())
      if (onSave) onSave(json)
      setError(null)
    } catch (err) {
      const errorMessage = 'Failed to save content'
      setError(errorMessage)
      if (onError) onError(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }, [editor, onSave, onError])

  // Handle adding an image from URL
  const addImage = useCallback(() => {
    if (!editor) return

    // Cancel if no URL
    if (!imageUrl) return

    // Add image
    editor.chain().focus().setImage({ src: imageUrl }).run()

    // Reset field
    setImageUrl('')
  }, [editor, imageUrl])

  // Image resizing handlers
  const handleImageWidthChange = useCallback(
    (value: number[]) => {
      if (!editor || !selectedImage) return

      isResizingRef.current = true // Set resizing flag
      setResizePopoverOpen(true) // Keep the popover open during resize

      const newWidth = value[0]
      let newHeight = selectedImage.height

      // If maintaining aspect ratio, calculate the new height
      if (maintainAspectRatio) {
        newHeight = Math.round(newWidth / aspectRatio)
      }

      runOnSelectedImage(() => {
        editor.chain().focus().updateImageSize({ width: newWidth, height: newHeight }).run()
      })

      // Update the selected image state
      setSelectedImage({ ...selectedImage, width: newWidth, height: newHeight })

      // Clear the resizing flag after a short delay
      setTimeout(() => {
        isResizingRef.current = false
      }, 100)
    },
    [editor, selectedImage, maintainAspectRatio, aspectRatio, runOnSelectedImage]
  )

  const handleImageHeightChange = useCallback(
    (value: number[]) => {
      if (!editor || !selectedImage) return

      isResizingRef.current = true // Set resizing flag
      setResizePopoverOpen(true) // Keep the popover open during resize

      const newHeight = value[0]
      let newWidth = selectedImage.width

      // If maintaining aspect ratio, calculate the new width
      if (maintainAspectRatio) {
        newWidth = Math.round(newHeight * aspectRatio)
      }

      runOnSelectedImage(() => {
        editor.chain().focus().updateImageSize({ width: newWidth, height: newHeight }).run()
      })

      // Update the selected image state
      setSelectedImage({ ...selectedImage, width: newWidth, height: newHeight })

      // Clear the resizing flag after a short delay
      setTimeout(() => {
        isResizingRef.current = false
      }, 100)
    },
    [editor, selectedImage, maintainAspectRatio, aspectRatio, runOnSelectedImage]
  )

  const resetImageSize = useCallback(() => {
    if (!editor || !selectedImage) return

    // Get the original image dimensions
    const img = new Image()
    img.src = selectedImage.src

    img.onload = () => {
      const originalWidth = img.width
      const originalHeight = img.height

      runOnSelectedImage(() => {
        editor
          .chain()
          .focus()
          .updateImageSize({ width: originalWidth, height: originalHeight })
          .run()
      })

      // Update the selected image state
      setSelectedImage({ ...selectedImage, width: originalWidth, height: originalHeight })
      setAspectRatio(originalWidth / originalHeight)
    }
  }, [editor, selectedImage, runOnSelectedImage])

  const maximizeImage = useCallback(() => {
    if (!editor || !selectedImage) return

    // Get the editor container width
    const editorWidth = editorContainerRef.current?.clientWidth || 800
    const maxWidth = editorWidth - 40 // Subtract padding

    // Calculate height based on aspect ratio
    const newHeight = Math.round(maxWidth / aspectRatio)

    runOnSelectedImage(() => {
      editor.chain().focus().updateImageSize({ width: maxWidth, height: newHeight }).run()
    })

    // Update the selected image state
    setSelectedImage({ ...selectedImage, width: maxWidth, height: newHeight })
  }, [editor, selectedImage, aspectRatio, runOnSelectedImage])

  const toggleAspectRatio = useCallback(() => {
    setMaintainAspectRatio(!maintainAspectRatio)
  }, [maintainAspectRatio])

  const renderImagePopover = () => (
    <ImageResizePopover
      editor={editor}
      selectedImage={selectedImage}
      maintainAspectRatio={maintainAspectRatio}
      resizePopoverOpen={resizePopoverOpen}
      setResizePopoverOpen={setResizePopoverOpen}
      isResizingRef={isResizingRef}
      onWidthChange={handleImageWidthChange}
      onHeightChange={handleImageHeightChange}
      onSliderMouseDown={handleSliderMouseDown}
      onSliderMouseUp={handleSliderMouseUp}
      onMaximize={maximizeImage}
      onReset={resetImageSize}
      onToggleAspectRatio={toggleAspectRatio}
    />
  )

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-center p-8 border rounded-md">
          <div className="animate-pulse">Loading editor...</div>
        </div>
        <Skeleton height={2} mt={4} width="100%" radius="md" />
        <Skeleton height={2} width="100%" radius="md" />
        <Skeleton height={2} width="100%" radius="md" />
        <Skeleton height={2} width="100%" radius="md" />
      </div>
    )
  }

  return (
    <div
      className={cn(!readOnly ? 'border rounded-md relative' : '', className)}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onPaste={handlePaste}
      ref={editorContainerRef}
    >
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!readOnly && <UploadStatusPanel tasks={activeUploads} />}

      {/* The toolbar menu, same component as bubble mostly */}
      {!readOnly && (
        <Toolbar
          variant={isToolbarSticky ? 'floating' : 'fixed'}
          ref={toolbarRef}
          style={stickyToolbarStyle}
          className={cn(
            'relative z-50 transition-all duration-200',
            isToolbarSticky && 'dark:!bg-black/90 !bg-white/90',
            isToolbarSticky && 'fixed top-0 shadow-md border-t border-x rounded-md',
            toolbarClassName
          )}
        >
          <ToolbarGroup>
            <TextBubbleMenu editor={editor} />
          </ToolbarGroup>
          <ToolbarGroup>
            <ImageBubbleMenu
              editor={editor}
              selectedImage={selectedImage}
              renderImagePopover={renderImagePopover}
              enableImagePopover={true}
            />

            <LinkDialogButton
              editor={editor}
              linkUrl={linkUrl}
              setLinkUrl={setLinkUrl}
              onAddLink={setLink}
              onFetchMetadata={fetchLinkMetadata}
              linkMetadata={linkMetadata}
              isFetchingMetadata={isFetchingLinkMetadata}
              linkMetadataError={linkMetadataError}
            />

            <YoutubeDialogButton
              editor={editor}
              youtubeUrl={youtubeUrl}
              setYoutubeUrl={setYoutubeUrl}
              onAddYoutube={addYoutubeEmbed}
              onFetchYoutubeMetadata={fetchYoutubeMetadata}
              youtubeMetadata={youtubeMetadata}
              isFetchingYoutubeMetadata={isFetchingYoutubeMetadata}
              youtubeMetadataError={youtubeMetadataError}
            />

            <ImageDialogButton
              editor={editor}
              imageUrl={imageUrl}
              setImageUrl={setImageUrl}
              onAddImage={addImage}
              onOpenLibrary={() => {
                setMediaLibrarySelectType('image')
                setMediaLibraryOpen(true)
              }}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
              fileInputRef={fileInputRef}
              onFileInputChange={handleFileInputChange}
            />

            <FileDialogButton
              editor={editor}
              isUploadingFile={isUploadingFile}
              fileUploadProgress={fileUploadProgress}
              fileInputRef={fileUploadInputRef}
              onFileInputChange={handleFileUploadInputChange}
              onFileDrop={handleGenericFileUpload}
              onInsertFromUrl={handleInsertFileFromUrl}
              onOpenLibrary={() => {
                setMediaLibrarySelectType('file')
                setMediaLibraryOpen(true)
              }}
            />

            <AudioDialogButton
              editor={editor}
              isUploadingAudio={isUploadingAudio}
              audioUploadProgress={audioUploadProgress}
              audioInputRef={audioInputRef}
              onAudioInputChange={handleAudioInputChange}
              onAudioDrop={handleAudioUpload}
              onInsertFromUrl={handleInsertAudioFromUrl}
              onOpenLibrary={() => {
                setMediaLibrarySelectType('audio')
                setMediaLibraryOpen(true)
              }}
            />

            <VideoDialogButton
              editor={editor}
              isUploadingVideo={isUploadingVideo}
              videoUploadProgress={videoUploadProgress}
              videoInputRef={videoInputRef}
              onVideoInputChange={handleVideoInputChange}
              onVideoDrop={handleVideoUpload}
              onInsertFromUrl={handleInsertVideoFromUrl}
              onOpenLibrary={() => {
                setMediaLibrarySelectType('video')
                setMediaLibraryOpen(true)
              }}
            />

            <AlertDialogButton editor={editor} />
            <GridDialogButton editor={editor} />
            <ExcalidrawDialogButton editor={editor} />

            <TableInsertDialogButton
              editor={editor}
              open={tableDialogOpen}
              onOpenChange={setTableDialogOpen}
              rows={rows}
              cols={cols}
              withHeaderRow={withHeaderRow}
              setRows={setRows}
              setCols={setCols}
              setWithHeaderRow={setWithHeaderRow}
              onInsert={insertTable}
            />

            <TableOperationsDropdown
              editor={editor}
              onAddColumnBefore={addColumnBefore}
              onAddColumnAfter={addColumnAfter}
              onDeleteColumn={deleteColumn}
              onAddRowBefore={addRowBefore}
              onAddRowAfter={addRowAfter}
              onDeleteRow={deleteRow}
              onMergeOrSplitCells={mergeOrSplitCells}
              onDeleteTable={deleteTable}
            />
          </ToolbarGroup>

          <ToolbarGroup>
            <UtilsBubbleMenu editor={editor} />
          </ToolbarGroup>

          <div className="flex-1"></div>
          <ToolbarGroup>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isPreviewMode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setIsPreviewMode((prev) => !prev)}
                  className="ml-auto"
                >
                  {isPreviewMode ? (
                    <>
                      <EyeOff className="h-4 w-4" />
                      Edit
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4" />
                      Preview
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isPreviewMode ? 'Switch to Edit Mode' : 'Switch to Preview Mode'}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={saveContent}
                  disabled={isSaving || !editor?.isEditable}
                >
                  {isSaving ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : error ? (
                    <>
                      <X className="h-4 w-4" />
                    </>
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Local Status</TooltipContent>
            </Tooltip>
          </ToolbarGroup>
        </Toolbar>
      )}

      {/* Bubble Menu for quick formatting */}
      {editor && !readOnly && !isPreviewMode && (
        <BubbleMenu
          editor={editor}
          shouldShow={({ editor: currentEditor, state }) => {
            if (!currentEditor.isEditable) return false
            if (selectedImage) return true
            const selection = state.selection
            const isCellSelection =
              '$anchorCell' in (selection as Selection) && '$headCell' in (selection as Selection)
            if (isCellSelection) return true
            if (selection instanceof NodeSelection) {
              return isTableNodeName(selection.node.type.name)
            }
            return !state.selection.empty
          }}
          className="bg-background rounded-md shadow-md p-1 flex gap-1 border"
        >
          <>
            {isInTableContext ? (
              <TableBubbleMenu
                onAddColumnBefore={addColumnBefore}
                onAddColumnAfter={addColumnAfter}
                onDeleteColumn={deleteColumn}
                onAddRowBefore={addRowBefore}
                onAddRowAfter={addRowAfter}
                onDeleteRow={deleteRow}
                onMergeOrSplitCells={mergeOrSplitCells}
                onDeleteTable={deleteTable}
              />
            ) : (
              <>
                {!selectedImage && <TextBubbleMenu editor={editor} />}
                <ImageBubbleMenu
                  editor={editor}
                  selectedImage={selectedImage}
                  renderImagePopover={renderImagePopover}
                  enableImagePopover={false}
                />
                <UtilsBubbleMenu editor={editor} />
              </>
            )}
          </>
        </BubbleMenu>
      )}

      <div ref={editorContentRef}>
        <EditorContent
          editor={editor}
          className={cn(
            'prose max-w-none focus:outline-none min-h-[200px]',
            readOnly ? 'p-0' : 'p-4 ',
            editorClassName
          )}
        />
      </div>

      {/* Media Library Dialog */}
      <MediaLibraryDialog
        open={mediaLibraryOpen}
        onOpenChange={setMediaLibraryOpen}
        pickerType={mediaLibrarySelectType}
        onSelectImage={(url) => {
          if (editor) {
            if (mediaLibrarySelectType === 'file') {
              handleInsertFileFromUrl(url)
            } else if (mediaLibrarySelectType === 'audio') {
              handleInsertAudioFromUrl(url)
            } else if (mediaLibrarySelectType === 'video') {
              handleInsertVideoFromUrl(url)
            } else {
              editor.chain().focus().setImage({ src: url }).run()
            }
          }
        }}
        getURL={getMediaURL!}
        deleteURL={deleteMediaURL!}
      />
    </div>
  )
}
