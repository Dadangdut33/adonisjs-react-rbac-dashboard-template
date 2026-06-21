import { type NodeViewProps, NodeViewWrapper } from '@tiptap/react'
import {
  Archive,
  FileSpreadsheet,
  FileText,
  FileType,
  FileUp,
  FileVideo,
  FileVolume2,
  Link as LinkIcon,
  Pencil,
  Save,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { cn, formatBytes } from '~/lib/utils'

type CardSize = 'sm' | 'md' | 'lg'
type Position = 'left' | 'center' | 'right'

type FileAttachmentAttrs = {
  url: string
  name: string
  mimeType?: string
  extension?: string
  size?: number
  cardSize?: CardSize
  position?: Position
}

type FormState = {
  url: string
  name: string
  mimeType: string
  extension: string
  size: string
  cardSize: CardSize
  position: Position
}

const getFileTypeLabel = (attrs: FileAttachmentAttrs) => {
  const mime = (attrs.mimeType || '').toLowerCase()
  const ext = (attrs.extension || '').toLowerCase()

  const archiveExts = ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz']
  if (archiveExts.includes(ext) || mime.includes('zip') || mime.includes('compressed'))
    return 'Archive'
  if (mime.includes('pdf') || ext === 'pdf') return 'PDF'
  if (mime.includes('word') || ['doc', 'docx', 'odt', 'rtf'].includes(ext)) return 'Document'
  if (mime.includes('sheet') || ['xls', 'xlsx', 'ods', 'csv'].includes(ext)) return 'Spreadsheet'
  if (mime.includes('presentation') || ['ppt', 'pptx', 'odp'].includes(ext)) return 'Presentation'
  if (mime.startsWith('video/')) return 'Video'
  if (mime.startsWith('audio/')) return 'Audio'
  if (mime.startsWith('text/')) return 'Text'

  return 'File'
}

const getFileIcon = (attrs: FileAttachmentAttrs) => {
  const mime = (attrs.mimeType || '').toLowerCase()
  const ext = (attrs.extension || '').toLowerCase()

  const archiveExts = ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz']
  if (archiveExts.includes(ext) || mime.includes('zip') || mime.includes('compressed'))
    return Archive
  if (mime.includes('sheet') || ['xls', 'xlsx', 'ods', 'csv'].includes(ext)) return FileSpreadsheet
  if (mime.includes('pdf') || mime.includes('word') || mime.startsWith('text/')) return FileText
  if (mime.startsWith('video/')) return FileVideo
  if (mime.startsWith('audio/')) return FileVolume2
  return FileType
}

const attrsToForm = (attrs: FileAttachmentAttrs): FormState => ({
  url: attrs.url || '',
  name: attrs.name || '',
  mimeType: attrs.mimeType || '',
  extension: attrs.extension || '',
  size: String(attrs.size || 0),
  cardSize: attrs.cardSize || 'md',
  position: attrs.position || 'center',
})

export default function FileAttachmentNodeView({ node, editor, updateAttributes }: NodeViewProps) {
  const [isEditable, setIsEditable] = useState(!!editor?.isEditable)
  const [isEditing, setIsEditing] = useState(false)
  const attrs = node.attrs as FileAttachmentAttrs
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
    attrs.name,
    attrs.mimeType,
    attrs.extension,
    attrs.size,
    attrs.cardSize,
    attrs.position,
    isEditing,
  ])

  const cardSize = isEditing ? form.cardSize : attrs.cardSize || 'md'
  const position = isEditing ? form.position : attrs.position || 'center'
  const widthClass =
    cardSize === 'sm'
      ? 'w-[22rem] max-w-full'
      : cardSize === 'lg'
        ? 'w-full'
        : 'w-[34rem] max-w-full'
  const positionClass =
    position === 'left' ? 'mr-auto' : position === 'right' ? 'ml-auto' : 'mx-auto'

  const mergedAttrs: FileAttachmentAttrs = {
    ...attrs,
    url: isEditing ? form.url : attrs.url,
    name: isEditing ? form.name : attrs.name,
    mimeType: isEditing ? form.mimeType : attrs.mimeType,
    extension: isEditing ? form.extension : attrs.extension,
    size: isEditing ? Number.parseInt(form.size, 10) || 0 : attrs.size,
    cardSize,
    position,
  }

  const FileIcon = getFileIcon(mergedAttrs)
  const typeLabel = getFileTypeLabel(mergedAttrs)
  const extensionLabel = (mergedAttrs.extension || '').toUpperCase()
  const sizeLabel = formatBytes(mergedAttrs.size || 0)

  const updateField = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const updateLayoutField = (key: 'cardSize' | 'position', value: CardSize | Position) => {
    setForm((prev) => ({ ...prev, [key]: value as never }))
    if (!isEditable) return
    updateAttributes({ [key]: value })
  }

  const saveManualEdit = () => {
    if (!isEditable) return

    updateAttributes({
      url: form.url.trim(),
      name: form.name.trim(),
      mimeType: form.mimeType.trim(),
      extension: form.extension.trim().toLowerCase(),
      size: Number.parseInt(form.size, 10) || 0,
      cardSize: form.cardSize,
      position: form.position,
    })
    setIsEditing(false)
  }

  const cancelManualEdit = () => {
    setForm(attrsToForm(attrs))
    setIsEditing(false)
  }

  const card = (
    <Card className={cn('gap-0 overflow-hidden py-4', widthClass, positionClass)}>
      <CardContent className="px-4">
        <div className="flex items-start gap-3">
          <div className="rounded-base border-2 border-border bg-secondary-background p-2">
            <FileIcon className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-heading">{mergedAttrs.name || 'Untitled File'}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {mergedAttrs.mimeType || 'Unknown file type'}
            </p>

            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="neutral">{typeLabel}</Badge>
              {extensionLabel ? <Badge variant="neutral">{extensionLabel}</Badge> : null}
              <Badge variant="neutral">{sizeLabel}</Badge>
            </div>
          </div>

          {mergedAttrs.url ? (
            <a
              href={mergedAttrs.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex rounded-base border-2 border-border bg-secondary-background p-2"
              onClick={(e) => e.stopPropagation()}
            >
              <LinkIcon className="h-4 w-4" />
            </a>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <NodeViewWrapper className="not-prose my-3">
      {isEditable && (
        <div className={cn('mb-2 flex flex-wrap items-center gap-2', widthClass, positionClass)}>
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
            value={form.cardSize}
            onChange={(e) => updateLayoutField('cardSize', e.target.value as CardSize)}
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
        </div>
      )}

      {isEditing && isEditable ? (
        <div className={cn('mb-3 grid gap-2 rounded-base border-2 border-border bg-secondary-background p-3', widthClass, positionClass)}>
          <Input
            value={form.url}
            onChange={(e) => updateField('url', e.target.value)}
            placeholder="File URL"
          />
          <Input
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="File name"
          />
          <Input
            value={form.mimeType}
            onChange={(e) => updateField('mimeType', e.target.value)}
            placeholder="MIME type (e.g. application/pdf)"
          />
          <Input
            value={form.extension}
            onChange={(e) => updateField('extension', e.target.value)}
            placeholder="Extension (e.g. pdf)"
          />
          <Input
            type="number"
            min={0}
            value={form.size}
            onChange={(e) => updateField('size', e.target.value)}
            placeholder="File size in bytes"
          />
        </div>
      ) : null}

      {!isEditable && attrs.url ? (
        <a
          href={attrs.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn('block max-w-full', widthClass, positionClass)}
        >
          {card}
        </a>
      ) : (
        card
      )}
      {isEditable ? (
        <p className={cn('mt-1 text-xs text-muted-foreground', widthClass, positionClass)}>
          <FileUp className="mr-1 inline-block h-3 w-3" />
          File attachment block
        </p>
      ) : null}
    </NodeViewWrapper>
  )
}
