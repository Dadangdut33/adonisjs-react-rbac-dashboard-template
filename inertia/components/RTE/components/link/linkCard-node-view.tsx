import { type NodeViewProps, NodeViewWrapper } from '@tiptap/react'
import { Loader2, Pencil, RefreshCw, Save, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import ImageWithLoader from '~/components/core/image'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { api } from '~/lib/axios'
import { urlFor } from '~/lib/client'
import { cn, limitString } from '~/lib/utils'

const normalizeExternalUrl = (rawUrl: string) => {
  const trimmed = rawUrl.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

const parseUrl = (url: string) => {
  try {
    const parsed = new URL(url)
    return {
      hostname: parsed.hostname.replace(/^www\./, ''),
      displayUrl: `${parsed.hostname.replace(/^www\./, '')}${parsed.pathname === '/' ? '' : parsed.pathname}`,
    }
  } catch {
    return {
      hostname: 'External Link',
      displayUrl: url,
    }
  }
}

type LinkCardAttrs = {
  url: string
  title?: string | null
  description?: string | null
  imageUrl?: string | null
  siteName?: string | null
  size?: 'sm' | 'md' | 'lg'
  position?: 'left' | 'center' | 'right'
  keyUpdate?: string
}

type FormState = {
  url: string
  title: string
  description: string
  imageUrl: string
  siteName: string
  size: 'sm' | 'md' | 'lg'
  position: 'left' | 'center' | 'right'
}

const attrsToForm = (attrs: LinkCardAttrs): FormState => ({
  url: attrs.url || '',
  title: attrs.title || '',
  description: attrs.description || '',
  imageUrl: attrs.imageUrl || '',
  siteName: attrs.siteName || '',
  size: attrs.size || 'md',
  position: attrs.position || 'center',
})

export default function LinkCardNodeView({ node, editor, updateAttributes }: NodeViewProps) {
  const [isEditable, setIsEditable] = useState(!!editor?.isEditable)
  const [isEditing, setIsEditing] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const attrs = node.attrs as LinkCardAttrs
  const [form, setForm] = useState<FormState>(() => attrsToForm(attrs))

  useEffect(() => {
    if (!isEditing) {
      setForm(attrsToForm(attrs))
    }
  }, [
    attrs.url,
    attrs.title,
    attrs.description,
    attrs.imageUrl,
    attrs.siteName,
    attrs.size,
    attrs.position,
    attrs.keyUpdate,
    isEditing,
  ])

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

  const parsed = useMemo(() => parseUrl(form.url || attrs.url || ''), [form.url, attrs.url])
  const resolvedTitle = (isEditing ? form.title : attrs.title)?.trim() || parsed.hostname
  const resolvedDescription =
    (isEditing ? form.description : attrs.description)?.trim() ||
    'Click to open this link in a new tab.'
  const resolvedSiteName = (isEditing ? form.siteName : attrs.siteName)?.trim() || parsed.hostname
  const resolvedImageUrl = (isEditing ? form.imageUrl : attrs.imageUrl)?.trim() || null
  const resolvedUrl = normalizeExternalUrl((isEditing ? form.url : attrs.url) || '')
  const resolvedSize = isEditing ? form.size : attrs.size || 'md'
  const resolvedPosition = isEditing ? form.position : attrs.position || 'center'

  const alignmentClass =
    resolvedPosition === 'left'
      ? 'justify-start'
      : resolvedPosition === 'right'
        ? 'justify-end'
        : 'justify-center'

  const widthClass =
    resolvedSize === 'sm'
      ? 'w-[22rem] max-w-full'
      : resolvedSize === 'lg'
        ? 'w-full'
        : 'w-[34rem] max-w-full'

  const cardBoxClass = cn('max-w-full', widthClass)

  const updateField = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const updateLayoutField = (
    key: 'size' | 'position',
    value: FormState['size'] | FormState['position']
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (!isEditable) return
    updateAttributes({ [key]: value })
  }

  const saveManualEdit = () => {
    if (!isEditable) return
    const normalizedUrl = normalizeExternalUrl(form.url)
    if (!normalizedUrl) return

    updateAttributes({
      url: normalizedUrl,
      title: form.title || null,
      description: form.description || null,
      imageUrl: form.imageUrl || null,
      siteName: form.siteName || null,
      size: form.size,
      position: form.position,
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
    const normalizedUrl = normalizeExternalUrl(form.url || attrs.url || '')
    if (!normalizedUrl) return

    setIsFetching(true)
    setFetchError(null)
    try {
      const response = await api.get(urlFor('api.v1.utils.link-metadata'), {
        params: { url: normalizedUrl },
      })
      const data = response.data?.data

      const nextAttrs: LinkCardAttrs = {
        url: normalizedUrl,
        title: typeof data?.title === 'string' ? data.title : null,
        description: typeof data?.description === 'string' ? data.description : null,
        imageUrl: typeof data?.imageUrl === 'string' ? data.imageUrl : null,
        siteName: typeof data?.siteName === 'string' ? data.siteName : null,
        size: form.size,
        position: form.position,
      }

      updateAttributes(nextAttrs)
      setForm(attrsToForm(nextAttrs))
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Failed to fetch metadata')
    } finally {
      setIsFetching(false)
    }
  }

  const cardContent = (
    <Card className={cn('group gap-0 overflow-hidden pt-0', cardBoxClass)}>
      {resolvedImageUrl ? (
        <div className="h-45 overflow-hidden border-b-2 border-border bg-muted">
          <ImageWithLoader
            src={resolvedImageUrl}
            alt={resolvedTitle}
            className="rounded-none h-full w-full object-cover transition-transform duration-300 scale-[1.02]"
            loading="lazy"
            height={'100%'}
          />
        </div>
      ) : (
        <div className="flex h-24 items-center justify-center border-b-2 border-border bg-secondary/40">
          <span className="text-xs font-semibold text-muted-foreground">{resolvedSiteName}</span>
        </div>
      )}

      <CardContent className="space-y-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="neutral" className="max-w-[80%] truncate">
            {resolvedSiteName}
          </Badge>
        </div>

        <h4 className="line-clamp-2 text-sm font-heading">{resolvedTitle}</h4>
        <p className="line-clamp-2 text-xs text-muted-foreground">{resolvedDescription}</p>
        <p className="text-xs text-muted-foreground/80">{limitString(parsed.displayUrl, 70)}</p>
      </CardContent>
    </Card>
  )

  return (
    <NodeViewWrapper className="not-prose my-3">
      {isEditable && (
        <div className={cn('mb-2 flex w-full flex-wrap items-center gap-2', alignmentClass)}>
          <div className={cn('flex flex-wrap items-center gap-2', cardBoxClass)}>
            <Button
              size="sm"
              variant="outline"
              type="button"
              onClick={refetchMetadata}
              disabled={isFetching || !normalizeExternalUrl(form.url || attrs.url || '')}
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
              onChange={(e) => updateLayoutField('size', e.target.value as FormState['size'])}
              className="h-9 rounded-base border-2 border-border bg-secondary-background px-3 text-sm"
            >
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
            </select>

            <select
              value={form.position}
              onChange={(e) =>
                updateLayoutField('position', e.target.value as FormState['position'])
              }
              className="h-9 rounded-base border-2 border-border bg-secondary-background px-3 text-sm"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </div>
      )}

      {fetchError ? <p className="mb-2 text-sm text-destructive">{fetchError}</p> : null}

      {isEditing && isEditable && (
        <div className="mb-3 grid gap-2 rounded-base border-2 border-border bg-secondary-background p-3">
          <Input
            value={form.url}
            onChange={(e) => updateField('url', e.target.value)}
            placeholder="https://example.com"
          />
          <Input
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Title"
          />
          <Input
            value={form.siteName}
            onChange={(e) => updateField('siteName', e.target.value)}
            placeholder="Site name"
          />
          <Input
            value={form.imageUrl}
            onChange={(e) => updateField('imageUrl', e.target.value)}
            placeholder="Image URL"
          />
          <Textarea
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Description"
            className="min-h-[70px]"
          />
        </div>
      )}

      <div className={cn('flex w-full', alignmentClass)}>
        {!isEditable && resolvedUrl ? (
          <a
            href={resolvedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn('inline-block max-w-full align-top', cardBoxClass)}
          >
            {cardContent}
          </a>
        ) : (
          cardContent
        )}
      </div>
    </NodeViewWrapper>
  )
}
