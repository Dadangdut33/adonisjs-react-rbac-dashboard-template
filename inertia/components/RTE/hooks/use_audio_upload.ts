import { Editor } from '@tiptap/react'
import type { ChangeEvent, RefObject } from 'react'
import { useCallback, useRef, useState } from 'react'

import { uploadFile } from '../upload-service'

const AUDIO_UPLOAD_MAX_SIZE_BYTES = 50 * 1024 * 1024
const AUDIO_EXTENSIONS = new Set(['mp3', 'wav', 'm4a', 'flac', 'ogg', 'aac', 'opus'])

const getFileExtension = (name: string) => {
  const parts = name.split('.')
  if (parts.length < 2) return ''
  return parts.pop()!.toLowerCase()
}

const getFileNameFromUrl = (url: string) => {
  try {
    const parsed = new URL(url)
    const pathname = parsed.pathname.split('/').filter(Boolean)
    return decodeURIComponent(pathname[pathname.length - 1] || 'audio')
  } catch {
    return 'audio'
  }
}

const resetFileInput = (ref: RefObject<HTMLInputElement | null>) => {
  if (ref.current) ref.current.value = ''
}

export default function useAudioUpload({
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
  const [isUploadingAudio, setIsUploadingAudio] = useState(false)
  const [audioUploadProgress, setAudioUploadProgress] = useState(0)
  const audioInputRef = useRef<HTMLInputElement>(null)

  const insertAudioAttachment = useCallback(
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
            type: 'audioAttachment',
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

  const handleAudioUpload = useCallback(
    async (file: File) => {
      if (!editor || !editor.isEditable || !uploadMediaURL) return

      const extension = getFileExtension(file.name)
      const isAudio = file.type.toLowerCase().startsWith('audio/') || AUDIO_EXTENSIONS.has(extension)
      if (!isAudio) {
        const errorMessage = 'Only audio files are allowed'
        setError(errorMessage)
        onError?.(errorMessage)
        return
      }

      if (file.size > AUDIO_UPLOAD_MAX_SIZE_BYTES) {
        const errorMessage = 'Audio size must be less than 50MB'
        setError(errorMessage)
        onError?.(errorMessage)
        return
      }

      setIsUploadingAudio(true)
      setAudioUploadProgress(0)
      try {
        const uploaded = await uploadFile(file, uploadMediaURL, tags, (progress) => {
          setAudioUploadProgress(progress)
        })
        insertAudioAttachment({
          url: uploaded.url,
          name: uploaded.name || file.name,
          mimeType: uploaded.mime_type || file.type,
          extension: uploaded.extension || extension,
          size: uploaded.size || file.size,
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to upload audio'
        setError(errorMessage)
        onError?.(errorMessage)
      } finally {
        setIsUploadingAudio(false)
        setAudioUploadProgress(0)
      }

      resetFileInput(audioInputRef)
    },
    [editor, uploadMediaURL, tags, setError, onError, insertAudioAttachment]
  )

  const handleAudioInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        handleAudioUpload(files[0])
      }
      resetFileInput(audioInputRef)
    },
    [handleAudioUpload]
  )

  const handleInsertFromUrl = useCallback(
    (url: string) => {
      const normalized = url.trim()
      if (!normalized) return
      insertAudioAttachment({
        url: normalized,
        name: getFileNameFromUrl(normalized),
      })
    },
    [insertAudioAttachment]
  )

  return {
    isUploadingAudio,
    audioUploadProgress,
    audioInputRef,
    handleAudioUpload,
    handleAudioInputChange,
    handleInsertFromUrl,
  }
}

