import { type NodeViewProps, NodeViewWrapper } from '@tiptap/react'
import { Loader2, Pencil, RefreshCw, Save, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import ImageWithLoader from '~/components/core/image'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { api } from '~/lib/axios'
import { cn } from '~/lib/utils'

type Size = 'sm' | 'md' | 'lg'
type Position = 'left' | 'center' | 'right'
type AspectRatio = '16/9' | '4/3' | '1/1'

type YoutubeAttrs = {
  url: string
  videoId: string
  title?: string | null
  thumbnailUrl?: string | null
  size?: Size
  position?: Position
  aspectRatio?: AspectRatio
  startAt?: number
}

type FormState = {
  url: string
  title: string
  thumbnailUrl: string
  size: Size
  position: Position
  aspectRatio: AspectRatio
  startAt: string
}

const extractYoutubeVideoId = (input: string) => {
  const trimmed = input.trim()
  if (!trimmed) return null

  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ]

  for (const pattern of patterns) {
    const match = trimmed.match(pattern)
    if (match?.[1]) return match[1]
  }

  return null
}

const normalizeYoutubeUrl = (input: string) => {
  const trimmed = input.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

const attrsToForm = (attrs: YoutubeAttrs): FormState => ({
  url: attrs.url || '',
  title: attrs.title || '',
  thumbnailUrl: attrs.thumbnailUrl || '',
  size: attrs.size || 'md',
  position: attrs.position || 'center',
  aspectRatio: attrs.aspectRatio || '16/9',
  startAt: String(attrs.startAt || 0),
})

export default function YoutubeNodeView({ node, editor, updateAttributes }: NodeViewProps) {
  const [isEditable, setIsEditable] = useState(!!editor?.isEditable)
  const [isEditing, setIsEditing] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const attrs = node.attrs as YoutubeAttrs
  const [form, setForm] = useState<FormState>(() => attrsToForm(attrs))

  useEffect(() => {
    const syncEditable = () => setIsEditable(!!editor?.isEditable)

    syncEditable()
    editor.on('transaction', syncEditable)
    editor.on('selectionUpdate', syncEditable)
    editor.on('focus', syncEditable)
    editor.on('blur', syncEditable)

    return () => {
      editor.off('transaction', syncEditable)
      editor.off('selectionUpdate', syncEditable)
      editor.off('focus', syncEditable)
      editor.off('blur', syncEditable)
    }
  }, [editor])
  useEffect(() => {
    if (!isEditing) {
      setForm(attrsToForm(attrs))
    }
  }, [
    attrs.url,
    attrs.videoId,
    attrs.title,
    attrs.thumbnailUrl,
    attrs.size,
    attrs.position,
    attrs.aspectRatio,
    attrs.startAt,
    isEditing,
  ])

  const resolvedSize = isEditing ? form.size : attrs.size || 'md'
  const resolvedPosition = isEditing ? form.position : attrs.position || 'center'
  const resolvedAspect = isEditing ? form.aspectRatio : attrs.aspectRatio || '16/9'
  const resolvedTitle = (isEditing ? form.title : attrs.title)?.trim() || 'YouTube Video'
  const resolvedUrl = normalizeYoutubeUrl((isEditing ? form.url : attrs.url) || '')
  const resolvedVideoId = extractYoutubeVideoId(resolvedUrl) || attrs.videoId || ''
  const startAtRaw = Number.parseInt(isEditing ? form.startAt : String(attrs.startAt || 0), 10)
  const startAt = Number.isFinite(startAtRaw) && startAtRaw > 0 ? startAtRaw : 0
  const thumbnailUrl =
    (isEditing ? form.thumbnailUrl : attrs.thumbnailUrl)?.trim() ||
    (resolvedVideoId ? `https://img.youtube.com/vi/${resolvedVideoId}/hqdefault.jpg` : '')

  const wrapperPositionClass =
    resolvedPosition === 'left' ? 'mr-auto' : resolvedPosition === 'right' ? 'ml-auto' : 'mx-auto'

  const widthClass =
    resolvedSize === 'sm'
      ? 'w-[22rem] max-w-full'
      : resolvedSize === 'lg'
        ? 'w-full'
        : 'w-[34rem] max-w-full'

  const iframeSrc = resolvedVideoId
    ? `https://www.youtube.com/embed/${resolvedVideoId}?start=${startAt}&rel=0`
    : ''

  const aspectClass =
    resolvedAspect === '4/3'
      ? 'aspect-[4/3]'
      : resolvedAspect === '1/1'
        ? 'aspect-square'
        : 'aspect-video'

  const updateField = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const updateLayoutField = (
    key: 'size' | 'position' | 'aspectRatio',
    value: Size | Position | AspectRatio
  ) => {
    setForm((prev) => ({ ...prev, [key]: value as never }))
    if (!isEditable) return
    updateAttributes({ [key]: value })
  }

  const saveManualEdit = () => {
    if (!isEditable) return
    const normalizedUrl = normalizeYoutubeUrl(form.url)
    const videoId = extractYoutubeVideoId(normalizedUrl)
    if (!normalizedUrl || !videoId) return

    updateAttributes({
      url: normalizedUrl,
      videoId,
      title: form.title || null,
      thumbnailUrl: form.thumbnailUrl || null,
      size: form.size,
      position: form.position,
      aspectRatio: form.aspectRatio,
      startAt: Number.parseInt(form.startAt, 10) || 0,
    })
    setFetchError(null)
    setIsEditing(false)
  }

  const cancelManualEdit = () => {
    setForm(attrsToForm(attrs))
    setFetchError(null)
    setIsEditing(false)
  }

  const refetchMetadata = async () => {
    if (!isEditable) return
    const normalizedUrl = normalizeYoutubeUrl(form.url || attrs.url || '')
    const videoId = extractYoutubeVideoId(normalizedUrl)
    if (!normalizedUrl || !videoId) return

    setIsFetching(true)
    setFetchError(null)
    try {
      const { data } = await api.get('https://noembed.com/embed', {
        params: { url: normalizedUrl },
      })
      const nextTitle = typeof data.title === 'string' ? data.title : null
      const nextThumb =
        typeof data.thumbnail_url === 'string'
          ? data.thumbnail_url
          : `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`

      updateAttributes({
        url: normalizedUrl,
        videoId,
        title: nextTitle,
        thumbnailUrl: nextThumb,
        size: form.size,
        position: form.position,
        aspectRatio: form.aspectRatio,
        startAt: Number.parseInt(form.startAt, 10) || 0,
      })
      setForm((prev) => ({
        ...prev,
        url: normalizedUrl,
        title: nextTitle || '',
        thumbnailUrl: nextThumb || '',
      }))
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Failed to fetch metadata')
    } finally {
      setIsFetching(false)
    }
  }

  return (
    <NodeViewWrapper className="not-prose my-3">
      {isEditable && (
        <div
          className={cn('mb-2 flex flex-wrap items-center gap-2', widthClass, wrapperPositionClass)}
        >
          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={refetchMetadata}
            disabled={isFetching || !resolvedVideoId}
          >
            {isFetching ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Refetching...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Refetch
              </>
            )}
          </Button>

          {!isEditing ? (
            <Button size="sm" variant="outline" type="button" onClick={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          ) : (
            <>
              <Button size="sm" type="button" onClick={saveManualEdit}>
                <Save className="h-4 w-4" />
                Save
              </Button>
              <Button size="sm" variant="outline" type="button" onClick={cancelManualEdit}>
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </>
          )}

          <select
            value={form.size}
            onChange={(e) => updateLayoutField('size', e.target.value as Size)}
            className="h-9 rounded-base border-2 border-border bg-secondary-background px-3 text-sm"
          >
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
          </select>

          <select
            value={form.position}
            onChange={(e) => updateLayoutField('position', e.target.value as Position)}
            className="h-9 rounded-base border-2 border-border bg-secondary-background px-3 text-sm"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>

          <select
            value={form.aspectRatio}
            onChange={(e) => updateLayoutField('aspectRatio', e.target.value as AspectRatio)}
            className="h-9 rounded-base border-2 border-border bg-secondary-background px-3 text-sm"
          >
            <option value="16/9">16:9</option>
            <option value="4/3">4:3</option>
            <option value="1/1">1:1</option>
          </select>
        </div>
      )}

      {fetchError ? <p className="mb-2 text-sm text-destructive">{fetchError}</p> : null}

      {isEditing && isEditable && (
        <div
          className={cn(
            'mb-3 grid gap-2 rounded-base border-2 border-border bg-secondary-background p-3',
            widthClass,
            wrapperPositionClass
          )}
        >
          <Input
            value={form.url}
            onChange={(e) => updateField('url', e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
          />
          <Input
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Video title"
          />
          <Input
            value={form.thumbnailUrl}
            onChange={(e) => updateField('thumbnailUrl', e.target.value)}
            placeholder="Thumbnail URL"
          />
          <Input
            type="number"
            min={0}
            value={form.startAt}
            onChange={(e) => updateField('startAt', e.target.value)}
            placeholder="Start at (seconds)"
          />
        </div>
      )}

      <Card className={cn('group gap-0 overflow-hidden', widthClass, wrapperPositionClass)}>
        <div
          className={cn('relative overflow-hidden border-b-2 border-border bg-black', aspectClass)}
        >
          {iframeSrc ? (
            <iframe
              src={iframeSrc}
              className={cn('h-full w-full', isEditable ? 'pointer-events-none' : '')}
              title={resolvedTitle}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : thumbnailUrl ? (
            <ImageWithLoader
              src={thumbnailUrl}
              alt={resolvedTitle}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-white/80">
              Invalid YouTube URL
            </div>
          )}
        </div>

        <CardContent className="space-y-2 p-4">
          <div className="flex items-center gap-2">
            <Badge variant="neutral">YouTube</Badge>
            {startAt > 0 ? <Badge variant="neutral">Start {startAt}s</Badge> : null}
          </div>
          <h4 className="line-clamp-2 text-sm font-heading">{resolvedTitle}</h4>
        </CardContent>
      </Card>
    </NodeViewWrapper>
  )
}
