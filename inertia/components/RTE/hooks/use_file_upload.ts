import { Editor } from '@tiptap/react'
import type { ChangeEvent, RefObject } from 'react'
import { useCallback, useRef, useState } from 'react'

import { uploadFile } from '../upload-service'

const FILE_UPLOAD_MAX_SIZE_BYTES = 50 * 1024 * 1024

const ACCEPTED_FILE_EXTENSIONS = new Set([
  'zip',
  'rar',
  '7z',
  'tar',
  'gz',
  'bz2',
  'xz',
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'ppt',
  'pptx',
  'odt',
  'ods',
  'odp',
  'rtf',
  'csv',
  'txt',
])

const ACCEPTED_FILE_MIME_PREFIXES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.',
  'application/vnd.ms-',
  'application/vnd.oasis.opendocument.',
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
  'application/vnd.rar',
  'application/x-7z-compressed',
  'application/x-tar',
  'application/gzip',
  'application/x-gzip',
  'application/x-bzip2',
  'application/x-xz',
  'text/plain',
  'text/csv',
]

const getFileExtension = (name: string) => {
  const parts = name.split('.')
  if (parts.length < 2) return ''
  return parts.pop()!.toLowerCase()
}

const getFileNameFromUrl = (url: string) => {
  try {
    const parsed = new URL(url)
    const pathname = parsed.pathname.split('/').filter(Boolean)
    return decodeURIComponent(pathname[pathname.length - 1] || 'attachment')
  } catch {
    return 'attachment'
  }
}

const resetFileInput = (ref: RefObject<HTMLInputElement | null>) => {
  if (ref.current) ref.current.value = ''
}

export default function useFileUpload({
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
  const [isUploadingFile, setIsUploadingFile] = useState(false)
  const [fileUploadProgress, setFileUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const insertFileAttachment = useCallback(
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
            type: 'fileAttachment',
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

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!editor || !editor.isEditable || !uploadMediaURL) return

      const extension = getFileExtension(file.name)
      const isAcceptedByExtension = ACCEPTED_FILE_EXTENSIONS.has(extension)
      const isAcceptedByMime = ACCEPTED_FILE_MIME_PREFIXES.some((prefix) =>
        file.type.toLowerCase().startsWith(prefix)
      )

      if (!isAcceptedByExtension && !isAcceptedByMime) {
        const errorMessage = 'Unsupported file type'
        setError(errorMessage)
        onError?.(errorMessage)
        return
      }

      if (file.size > FILE_UPLOAD_MAX_SIZE_BYTES) {
        const errorMessage = 'File size must be less than 50MB'
        setError(errorMessage)
        onError?.(errorMessage)
        return
      }

      setIsUploadingFile(true)
      setFileUploadProgress(0)

      try {
        const uploadedFile = await uploadFile(file, uploadMediaURL, tags, (progress) => {
          setFileUploadProgress(progress)
        })

        insertFileAttachment({
          url: uploadedFile.url,
          name: uploadedFile.name || file.name,
          mimeType: uploadedFile.mime_type || file.type,
          extension: uploadedFile.extension || extension,
          size: uploadedFile.size || file.size,
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to upload file'
        setError(errorMessage)
        onError?.(errorMessage)
      } finally {
        setIsUploadingFile(false)
        setFileUploadProgress(0)
      }

      resetFileInput(fileInputRef)
    },
    [editor, onError, uploadMediaURL, tags, setError, insertFileAttachment]
  )

  const handleFileInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        handleFileUpload(files[0])
      }
      resetFileInput(fileInputRef)
    },
    [handleFileUpload]
  )

  return {
    isUploadingFile,
    fileUploadProgress,
    fileInputRef,
    insertFileAttachment,
    handleInsertFromUrl: (url: string) => {
      const normalizedUrl = url.trim()
      if (!normalizedUrl || !editor || !editor.isEditable) return
      insertFileAttachment({
        url: normalizedUrl,
        name: getFileNameFromUrl(normalizedUrl),
      })
    },
    handleFileUpload,
    handleFileInputChange,
  }
}
