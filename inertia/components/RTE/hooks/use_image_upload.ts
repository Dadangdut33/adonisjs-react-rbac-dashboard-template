import { AllowedImageTags } from '#validators/media'

import { Editor } from '@tiptap/react'
import type { ChangeEvent, DragEvent, RefObject } from 'react'
import { useCallback, useRef, useState } from 'react'

import { uploadImage } from '../upload-service'

export default function useImageUpload({
  editor,
  setError,
  onError,
  uploadMediaURL,
  imageTags,
  readOnly,
}: {
  editor: Editor | null
  setError: (error: string) => void
  onError?: (error: string) => void
  uploadMediaURL?: string
  imageTags: AllowedImageTags[]
  readOnly: boolean
}) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetFileInput = (ref: RefObject<HTMLInputElement | null>) => {
    if (ref.current) {
      ref.current.value = ''
    }
  }

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!editor) return

      if (!file.type.startsWith('image/')) {
        const errorMessage = 'Only image files are allowed'
        setError(errorMessage)
        onError?.(errorMessage)
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        const errorMessage = 'Image file size must be less than 10MB'
        setError(errorMessage)
        onError?.(errorMessage)
        return
      }

      setIsUploading(true)
      setUploadProgress(0)

      try {
        const uploadedImage = await uploadImage(file, uploadMediaURL!, imageTags, (progress) => {
          setUploadProgress(progress)
        })

        editor.chain().focus().setImage({ src: uploadedImage.url, alt: file.name }).run()
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to upload image'
        setError(errorMessage)
        onError?.(errorMessage)
      } finally {
        setIsUploading(false)
        setUploadProgress(0)
      }

      resetFileInput(fileInputRef)
    },
    [editor, onError, uploadMediaURL, imageTags]
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

  const handleDrop = useCallback(
    (e: DragEvent) => {
      if (readOnly) return

      e.preventDefault()
      const files = e.dataTransfer.files
      if (files && files.length > 0) {
        handleFileUpload(files[0])
      }
    },
    [handleFileUpload, readOnly]
  )

  const handleDragOver = useCallback(
    (e: DragEvent) => {
      if (readOnly) return
      e.preventDefault()
    },
    [readOnly]
  )

  return {
    isUploading,
    uploadProgress,
    fileInputRef,
    handleFileUpload,
    handleFileInputChange,
    handleDrop,
    handleDragOver,
  }
}
