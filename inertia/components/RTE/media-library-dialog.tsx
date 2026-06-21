'use client'

import type { PaginationMeta } from '#types/app'

import { format } from 'date-fns'
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ExternalLink,
  FileText,
  Grid3X3,
  ImageIcon,
  List,
  Music2,
  Search,
  Trash2,
  Video,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Skeleton } from '~/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import type { Data } from '~data'

import ImageWithLoader from '../core/image'
import { deleteMedia, getMediaLibrary } from './upload-service'

interface MediaLibraryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectImage: (url: string) => void
  getURL: string
  deleteURL: string
  pickerType?: 'image' | 'file' | 'audio' | 'video'
}

type ViewMode = 'grid' | 'list'
type FilterType = 'all' | 'images' | 'files' | 'videos' | 'audio'

export default function MediaLibraryDialog({
  open,
  onOpenChange,
  onSelectImage,
  getURL,
  deleteURL,
  pickerType = 'image',
}: MediaLibraryDialogProps) {
  const [mediaData, setMediaData] = useState<Data.Media[] | null>(null)
  const [mediaMeta, setMediaMeta] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [externalUrl, setExternalUrl] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [filterType, setFilterType] = useState<FilterType>('all')

  // Search and pagination state
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(12)
  const [sortBy, _setSortBy] = useState('updated_at')
  const [sortDirection, _setSortDirection] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    switch (pickerType) {
      case 'image':
        setFilterType('images')
        break
      case 'audio':
        setFilterType('audio')
        break
      case 'video':
        setFilterType('videos')
        break
      case 'file':
        setFilterType('files')
        break
      default:
        setFilterType('all')
    }

    setCurrentPage(1)
  }, [pickerType])

  // Load media when dialog opens or when search/pagination changes
  useEffect(() => {
    if (open) {
      loadMedia()
    }
  }, [open, search, currentPage, perPage, sortBy, sortDirection, filterType])

  const loadMedia = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = {
        getURL,
        page: currentPage,
        per_page: perPage,
        search: search || undefined,
        sort: sortDirection === 'desc' ? `-${sortBy}` : sortBy,
        filter: filterType !== 'all' ? filterType : undefined,
      }

      const response = await getMediaLibrary(params)
      setMediaData(response.data!)
      setMediaMeta(response.meta!)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load media')
      console.error('Failed to load media:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMedia = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this media item?')
    if (!confirmed) return

    try {
      await deleteMedia(id, deleteURL)
      // Reload the current page
      await loadMedia()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete media')
    }
  }

  const handleSelectMedia = (media: Data.Media) => {
    onSelectImage(media.url!)
    onOpenChange(false)
  }

  const handleAddExternalImage = () => {
    if (externalUrl) {
      onSelectImage(externalUrl)
      setExternalUrl('')
      onOpenChange(false)
    }
  }

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
    setCurrentPage(1) // Reset to first page when searching
  }, [])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePerPageChange = (newPerPage: string) => {
    setPerPage(Number.parseInt(newPerPage))
    setCurrentPage(1)
  }

  const clearSearch = () => {
    setSearch('')
    setCurrentPage(1)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getMediaIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4" />
    }
    if (mimeType.startsWith('video/')) {
      return <Video className="h-4 w-4" />
    }
    if (mimeType.startsWith('audio/')) {
      return <Music2 className="h-4 w-4" />
    }
    return <FileText className="h-4 w-4" />
  }

  const isImageMime = (mimeType: string) => mimeType.startsWith('image/')
  const isVideoMime = (mimeType: string) => mimeType.startsWith('video/')
  const isAudioMime = (mimeType: string) => mimeType.startsWith('audio/')

  const getMediaTypeLabel = (mimeType: string) => {
    if (isImageMime(mimeType)) return 'Image'
    if (isVideoMime(mimeType)) return 'Video'
    if (isAudioMime(mimeType)) return 'Audio'
    return 'File'
  }

  const renderPagination = () => {
    if (!mediaData || mediaMeta!.last_page <= 1) return null

    const {
      current_page: current_page,
      last_page: last_page,
      previous_page_url: prev_page_url,
      next_page_url: next_page_url,
    } = mediaMeta!
    const from = (current_page - 1) * perPage + 1
    const to = Math.min(current_page * perPage, mediaMeta!.total)

    return (
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">
            Showing {from} to {to} of {mediaMeta!.total} results
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(1)}
            disabled={current_page === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(current_page - 1)}
            disabled={!prev_page_url}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="text-sm">
            Page {current_page} of {last_page}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(current_page + 1)}
            disabled={!next_page_url}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(last_page)}
            disabled={current_page === last_page}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  const renderMediaGrid = () => {
    if (!mediaData || !mediaData.length) {
      return (
        <div className="text-center py-12">
          <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {search ? 'No media found matching your search.' : 'No media in your library yet.'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Upload images using the image upload button in the editor.
          </p>
        </div>
      )
    }

    if (viewMode === 'grid') {
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mediaData.map((media) => (
            <div
              key={media.id}
              className="relative group border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-square overflow-hidden bg-muted">
                {isImageMime(media.mime_type) ? (
                  <button
                    type="button"
                    className="h-full w-full"
                    onClick={() => handleSelectMedia(media)}
                  >
                    <ImageWithLoader
                      src={media.url}
                      alt={media.name}
                      className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                    />
                  </button>
                ) : isVideoMime(media.mime_type) ? (
                  <button
                    type="button"
                    className="h-full w-full"
                    onClick={() => handleSelectMedia(media)}
                  >
                    <video
                      src={media.url}
                      muted
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-cover"
                    />
                  </button>
                ) : isAudioMime(media.mime_type) ? (
                  <button
                    type="button"
                    onClick={() => handleSelectMedia(media)}
                    className="flex h-full w-full flex-col items-center justify-center gap-2"
                  >
                    <Music2 className="h-8 w-8 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Audio</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSelectMedia(media)}
                    className="flex h-full w-full flex-col items-center justify-center gap-2"
                  >
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">File</span>
                  </button>
                )}
              </div>

              <div className="p-3">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate" title={media.name}>
                      {media.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {getMediaIcon(media.mime_type)}
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(media.size)}
                      </span>
                      <Badge variant="neutral" className="text-[10px]">
                        {getMediaTypeLabel(media.mime_type)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {media.updated_at
                        ? format(new Date(media.updated_at), 'MMM d, yyyy')
                        : format(new Date(media.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              </div>

              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteMedia(media.id)
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )
    }

    // List view
    return (
      <div className="space-y-2">
        {mediaData.map((media) => (
          <div
            key={media.id}
            className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer group"
            onClick={() => handleSelectMedia(media)}
          >
            <div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
              {isImageMime(media.mime_type) ? (
                <ImageWithLoader
                  src={media.url}
                  alt={media.name}
                  className="w-full h-full object-cover"
                />
              ) : isVideoMime(media.mime_type) ? (
                <video
                  src={media.url}
                  muted
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover"
                />
              ) : isAudioMime(media.mime_type) ? (
                <div className="flex h-full w-full items-center justify-center">
                  <Music2 className="h-5 w-5 text-muted-foreground" />
                </div>
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{media.name}</p>
              <div className="flex items-center gap-2 mt-1">
                {getMediaIcon(media.mime_type)}
                <span className="text-sm text-muted-foreground">{formatFileSize(media.size)}</span>
                <Badge variant="default" className="text-xs">
                  {getMediaTypeLabel(media.mime_type)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Updated {format(new Date(media.updated_at), 'MMM d, yyyy')}
              </p>
            </div>

            <Button
              variant="destructive"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation()
                handleDeleteMedia(media.id)
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    )
  }

  const renderLoadingSkeleton = () => {
    if (viewMode === 'grid') {
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square w-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
              <Skeleton className="h-3 w-1/6" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] flex flex-col overflow-y-scroll">
        <DialogHeader>
          <DialogTitle>Media Library</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="library" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="library">Library</TabsTrigger>
            <TabsTrigger value="external">External URL</TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="flex-1 flex flex-col space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search media..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 pr-10"
                />
                {search && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                    onClick={clearSearch}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                {/* <Select value={filterType} onValueChange={handleFilterChange}>
                  <SelectTrigger className="w-32">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="images">Images</SelectItem>
                    <SelectItem value="documents">Documents</SelectItem>
                  </SelectContent>
                </Select> */}

                <Select value={perPage.toString()} onValueChange={handlePerPageChange}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12</SelectItem>
                    <SelectItem value="24">24</SelectItem>
                    <SelectItem value="48">48</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="icon"
                    className="rounded-r-none"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="icon"
                    className="rounded-l-none"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Media Content */}
            <div className="flex-1 overflow-auto">
              {loading ? renderLoadingSkeleton() : renderMediaGrid()}
            </div>

            {/* Pagination */}
            {!loading && renderPagination()}
          </TabsContent>

          <TabsContent value="external" className="py-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="externalUrl">
                  {pickerType === 'image'
                    ? 'Image URL'
                    : pickerType === 'audio'
                      ? 'Audio URL'
                      : pickerType === 'video'
                        ? 'Video URL'
                        : 'File URL'}
                </Label>
                <div className="flex w-full items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <Input
                      id="externalUrl"
                      placeholder={
                        pickerType === 'image'
                          ? 'https://example.com/image.jpg'
                          : pickerType === 'audio'
                            ? 'https://example.com/audio.mp3'
                            : pickerType === 'video'
                              ? 'https://example.com/video.mp4'
                              : 'https://example.com/file.pdf'
                      }
                      value={externalUrl}
                      onChange={(e) => setExternalUrl(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Button
                    className="shrink-0"
                    onClick={handleAddExternalImage}
                    disabled={!externalUrl}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>
              {externalUrl && (
                <div className="mt-4 border rounded-md p-4">
                  <p className="text-sm font-medium mb-2">Preview:</p>
                  {pickerType === 'image' ? (
                    <div className="aspect-video bg-muted rounded-md overflow-hidden">
                      <ImageWithLoader
                        src={externalUrl || '/placeholder.svg'}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="rounded-md border p-3 text-sm break-all">{externalUrl}</div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
