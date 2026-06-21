import type { BaseAPIResponse } from '#types/api'

import axios from 'axios'
import { api } from '~/lib/axios'
import type { Data } from '~data'

export interface UploadedImage {
  id: string
  url: string
  name: string
  size: number
  type: string
  uploadedAt: string
}

export interface UploadedFile {
  id: string
  url: string
  name: string
  size: number
  mime_type: string
  extension?: string
}

// Get media library with pagination and search
export const getMediaLibrary = async (params: {
  getURL: string
  page?: number
  per_page?: number
  search?: string
  sort?: string
  filter?: string
}): Promise<BaseAPIResponse<Data.Media[]>> => {
  try {
    const response = await api.get(params.getURL, {
      params: {
        page: params.page,
        per_page: params.per_page,
        search: params.search,
        sort: params.sort,
        filter: params.filter,
      },
    })

    return response.data
  } catch (error) {
    console.error('Failed to fetch media library:', error)

    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message
      throw new Error(`Failed to load media library: ${message}`)
    }

    throw new Error('Failed to load media library')
  }
}

// Upload image to production API
export const uploadImage = async (
  file: File,
  uploadURL: string,
  imageTags?: string[],
  onProgress?: (progress: number) => void
): Promise<Data.Media> => {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are allowed')
  }

  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Image file size must be less than 10MB')
  }

  try {
    const response = await axios.post(
      uploadURL,
      {
        file,
        tags: imageTags,
      },
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100)
            onProgress(progress)
          }
        },
        timeout: 30000, // 30 seconds timeout
      }
    )

    return response.data.data || response.data
  } catch (error) {
    console.error('Upload error:', error)

    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Upload timeout - please try again')
      }

      const message = error.response?.data?.message || error.message
      throw new Error(`Upload failed: ${message}`)
    }

    throw new Error('Failed to upload image')
  }
}

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
  'mp3',
  'wav',
  'm4a',
  'flac',
  'ogg',
  'aac',
  'opus',
  'mp4',
  'mov',
  'avi',
  'mkv',
  'webm',
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
  'audio/',
  'video/',
]

const getFileExtension = (name: string) => {
  const parts = name.split('.')
  if (parts.length < 2) return ''
  return parts.pop()!.toLowerCase()
}

export const uploadFile = async (
  file: File,
  uploadURL: string,
  tags?: string[],
  onProgress?: (progress: number) => void
): Promise<UploadedFile> => {
  const extension = getFileExtension(file.name)
  const isAcceptedByExtension = ACCEPTED_FILE_EXTENSIONS.has(extension)
  const isAcceptedByMime = ACCEPTED_FILE_MIME_PREFIXES.some((prefix) =>
    file.type.toLowerCase().startsWith(prefix)
  )

  if (!isAcceptedByExtension && !isAcceptedByMime) {
    throw new Error('Unsupported file type')
  }

  if (file.size > FILE_UPLOAD_MAX_SIZE_BYTES) {
    throw new Error('File size must be less than 50MB')
  }

  try {
    const response = await axios.post(
      uploadURL,
      {
        file,
        tags,
      },
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100)
            onProgress(progress)
          }
        },
        timeout: 60000,
      }
    )

    return response.data.data || response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Upload timeout - please try again')
      }
      const message = error.response?.data?.message || error.message
      throw new Error(`Upload failed: ${message}`)
    }

  throw new Error('Failed to upload file')
  }
}

export const importMediaFromUrl = async (
  url: string,
  uploadURL: string,
  tags?: string[]
): Promise<Data.Media> => {
  try {
    const response = await api.post(uploadURL, {
      url,
      tags,
    })

    return response.data.data || response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message
      throw new Error(`URL import failed: ${message}`)
    }

    throw new Error('Failed to import media from URL')
  }
}

// Delete media item
export const deleteMedia = async (id: string, deleteURL: string): Promise<void> => {
  try {
    await axios.delete(deleteURL, { data: { id: id } })
  } catch (error) {
    console.error('Delete error:', error)

    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message
      throw new Error(`Failed to delete media: ${message}`)
    }

    throw new Error('Failed to delete media')
  }
}

// Legacy functions for backward compatibility
export const getLocalUploadedImages = (): UploadedImage[] => {
  try {
    const storedImages = JSON.parse(localStorage.getItem('uploadedImages') || '{}')
    return Object.values(storedImages)
  } catch (err) {
    console.error('Failed to retrieve uploaded images', err)
    return []
  }
}

export const getLocalUploadedImage = (id: string): UploadedImage | null => {
  try {
    const storedImages = JSON.parse(localStorage.getItem('uploadedImages') || '{}')
    return storedImages[id] || null
  } catch (err) {
    console.error('Failed to retrieve uploaded image', err)
    return null
  }
}

export const deleteLocalUploadedImage = (id: string): boolean => {
  try {
    const storedImages = JSON.parse(localStorage.getItem('uploadedImages') || '{}')
    if (storedImages[id]) {
      delete storedImages[id]
      localStorage.setItem('uploadedImages', JSON.stringify(storedImages))
      return true
    }
    return false
  } catch (err) {
    console.error('Failed to delete uploaded image', err)
    return false
  }
}
