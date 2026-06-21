import { Editor } from '@tiptap/react'
import type { ChangeEvent, RefObject } from 'react'
import { useCallback, useRef, useState } from 'react'

import { uploadFile } from '../upload-service'

const VIDEO_UPLOAD_MAX_SIZE_BYTES = 50 * 1024 * 1024
const VIDEO_EXTENSIONS = new Set(['mp4', 'mov', 'avi', 'mkv', 'webm'])

const getFileExtension = (name: string) => {
  const parts = name.split('.')
  if (parts.length < 2) return ''
  return parts.pop()!.toLowerCase()
}

const getFileNameFromUrl = (url: string) => {
  try {
    const parsed = new URL(url)
    const pathname = parsed.pathname.split('/').filter(Boolean)
    return decodeURIComponent(pathname[pathname.length - 1] || 'video')
  } catch {
    return 'video'
  }
}

const resetFileInput = (ref: RefObject<HTMLInputElement | null>) => {
  if (ref.current) ref.current.value = ''
}

export default function useVideoUpload({
  editor,
  setError,
  onError,
  uploadMediaURL,
  tags,
}: {
  editor: Editor | null
  setError: (error: string) => void
  onError?: (error: string) => void
  uploadMediaURL?: string
  tags?: string[]
}) {
  const [isUploadingVideo, setIsUploadingVideo] = useState(false)
  const [videoUploadProgress, setVideoUploadProgress] = useState(0)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const insertVideoAttachment = useCallback(
    ({
      url,
      name,
      mimeType,
      extension,
      size,
    }: {
      url: string
      name: string
      mimeType?: string
      extension?: string
      size?: number
    }) => {
      if (!editor || !editor.isEditable) return
      editor
        .chain()
        .focus()
        .insertContent([
          {
            type: 'videoAttachment',
            attrs: {
              url,
              name,
              mimeType: mimeType || '',
              extension: extension || '',
              size: size || 0,
              cardSize: 'md',
              position: 'center',
            },
          },
          { type: 'paragraph' },
        ])
        .run()
    },
    [editor]
  )

  const handleVideoUpload = useCallback(
    async (file: File) => {
      if (!editor || !editor.isEditable || !uploadMediaURL) return

      const extension = getFileExtension(file.name)
      const isVideo = file.type.toLowerCase().startsWith('video/') || VIDEO_EXTENSIONS.has(extension)
      if (!isVideo) {
        const errorMessage = 'Only video files are allowed'
        setError(errorMessage)
        onError?.(errorMessage)
        return
      }

      if (file.size > VIDEO_UPLOAD_MAX_SIZE_BYTES) {
        const errorMessage = 'Video size must be less than 50MB'
        setError(errorMessage)
        onError?.(errorMessage)
        return
      }

      setIsUploadingVideo(true)
      setVideoUploadProgress(0)
      try {
        const uploaded = await uploadFile(file, uploadMediaURL, tags, (progress) => {
          setVideoUploadProgress(progress)
        })
        insertVideoAttachment({
          url: uploaded.url,
          name: uploaded.name || file.name,
          mimeType: uploaded.mime_type || file.type,
          extension: uploaded.extension || extension,
          size: uploaded.size || file.size,
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to upload video'
        setError(errorMessage)
        onError?.(errorMessage)
      } finally {
        setIsUploadingVideo(false)
        setVideoUploadProgress(0)
      }

      resetFileInput(videoInputRef)
    },
    [editor, uploadMediaURL, tags, setError, onError, insertVideoAttachment]
  )

  const handleVideoInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        handleVideoUpload(files[0])
      }
      resetFileInput(videoInputRef)
    },
    [handleVideoUpload]
  )

  const handleInsertFromUrl = useCallback(
    (url: string) => {
      const normalized = url.trim()
      if (!normalized) return
      insertVideoAttachment({
        url: normalized,
        name: getFileNameFromUrl(normalized),
      })
    },
    [insertVideoAttachment]
  )

  return {
    isUploadingVideo,
    videoUploadProgress,
    videoInputRef,
    handleVideoUpload,
    handleVideoInputChange,
    handleInsertFromUrl,
  }
}
