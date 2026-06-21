import { type NodeViewProps, NodeViewWrapper } from '@tiptap/react'
import DOMPurify from 'dompurify'
import {
  AlertCircle,
  AlertTriangle,
  Bold,
  CheckCircle2,
  Info,
  Italic,
  Pencil,
  Save,
  Underline,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { cn } from '~/lib/utils'

type AlertType = 'info' | 'success' | 'warning' | 'error'
type CardSize = 'sm' | 'md' | 'lg'
type Position = 'left' | 'center' | 'right'

type AlertBlockAttrs = {
  alertType?: AlertType
  title?: string
  message?: string
  cardSize?: CardSize
  position?: Position
}

type FormState = {
  alertType: AlertType
  title: string
  message: string
  cardSize: CardSize
  position: Position
}

const attrsToForm = (attrs: AlertBlockAttrs): FormState => ({
  alertType: attrs.alertType || 'info',
  title: attrs.title || 'Info',
  message: attrs.message || '',
  cardSize: attrs.cardSize || 'md',
  position: attrs.position || 'center',
})

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const looksLikeHtml = (value: string) => /<\/?[a-z][\s\S]*>/i.test(value)

const normalizeRichText = (value: string | undefined, fallback = '', allowMultiline = false) => {
  const source = (value ?? '').trim() || fallback
  if (!source) return ''
  if (looksLikeHtml(source)) return source
  const escaped = escapeHtml(source)
  return allowMultiline ? escaped.replace(/\n/g, '<br />') : escaped
}

const htmlToPlainText = (value: string) => {
  return value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim()
}

function RichEditable({
  value,
  className,
  onFocus,
  onBlur,
  onChange,
}: {
  value: string
  className: string
  onFocus?: () => void
  onBlur?: () => void
  onChange: (html: string) => void
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    if (!ref.current || isFocused) return
    const sanitized = DOMPurify.sanitize(value || '')
    if (ref.current.innerHTML !== sanitized) {
      ref.current.innerHTML = sanitized
    }
  }, [value, isFocused])

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      className={className}
      onFocus={() => {
        setIsFocused(true)
        onFocus?.()
      }}
      onBlur={() => {
        setIsFocused(false)
        onBlur?.()
      }}
      onInput={(e) => {
        onChange((e.currentTarget as HTMLDivElement).innerHTML)
      }}
    />
  )
}

const getAlertStyles = (alertType: AlertType) => {
  if (alertType === 'success')
    return {
      cardClass: 'bg-emerald-50 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800',
      iconClass: 'text-emerald-600 dark:text-emerald-400',
      badgeClass: 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-black',
    }
  if (alertType === 'warning')
    return {
      cardClass: 'bg-amber-50 border-amber-300 dark:bg-amber-950/35 dark:border-amber-800',
      iconClass: 'text-amber-600 dark:text-amber-400',
      badgeClass: 'bg-amber-600 text-white dark:bg-amber-500 dark:text-black',
    }
  if (alertType === 'error')
    return {
      cardClass: 'bg-rose-50 border-rose-300 dark:bg-rose-950/35 dark:border-rose-800',
      iconClass: 'text-rose-600 dark:text-rose-400',
      badgeClass: 'bg-rose-600 text-white dark:bg-rose-500 dark:text-black',
    }
  return {
    cardClass: 'bg-sky-50 border-sky-300 dark:bg-sky-950/35 dark:border-sky-800',
    iconClass: 'text-sky-600 dark:text-sky-400',
    badgeClass: 'bg-sky-600 text-white dark:bg-sky-500 dark:text-black',
  }
}

const getAlertIcon = (alertType: AlertType) => {
  if (alertType === 'success') return CheckCircle2
  if (alertType === 'warning') return AlertTriangle
  if (alertType === 'error') return AlertCircle
  return Info
}

export default function AlertBlockNodeView({ node, editor, updateAttributes }: NodeViewProps) {
  const attrs = node.attrs as AlertBlockAttrs
  const [isEditable, setIsEditable] = useState(!!editor?.isEditable)
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState<FormState>(() => attrsToForm(attrs))
  const [activeField, setActiveField] = useState<'title' | 'message' | null>(null)

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
    if (!isEditing) setForm(attrsToForm(attrs))
  }, [attrs.alertType, attrs.title, attrs.message, attrs.cardSize, attrs.position, isEditing])

  const alertType = isEditing ? form.alertType : attrs.alertType || 'info'
  const title = isEditing ? form.title : normalizeRichText(attrs.title, 'Info')
  const message = isEditing ? form.message : normalizeRichText(attrs.message, '', true)
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

  const styles = getAlertStyles(alertType)
  const AlertIcon = getAlertIcon(alertType)

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const applyInlineFormat = (command: 'bold' | 'italic' | 'underline') => {
    if (!isEditable || !activeField) return
    document.execCommand(command, false)
  }

  const saveManualEdit = () => {
    if (!isEditable) return
    const plainTitle = htmlToPlainText(form.title)
    const plainMessage = htmlToPlainText(form.message)

    updateAttributes({
      alertType: form.alertType,
      title: plainTitle.length > 0 ? form.title.trim() : 'Info',
      message: plainMessage.length > 0 ? form.message.trim() : '',
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
    <Card className={cn('gap-0 border-2 py-4', styles.cardClass, widthClass, positionClass)}>
      <CardContent className="space-y-3 px-4">
        <div className="flex items-start gap-3">
          <div className="rounded-base border-2 border-border bg-background p-2">
            <AlertIcon className={cn('h-5 w-5', styles.iconClass)} />
          </div>
          <div className="min-w-0 flex-1">
            <p
              className="truncate text-sm font-heading text-foreground"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(title || 'Info') }}
            />
            <p
              className="mt-1 text-xs text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(message || '') }}
            />
          </div>
          <Badge className={cn('capitalize', styles.badgeClass)}>{alertType}</Badge>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <NodeViewWrapper className="not-prose my-3">
      {isEditable ? (
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
        </div>
      ) : null}

      {isEditing && isEditable ? (
        <div
          className={cn(
            'mb-3 grid gap-2 rounded-base border-2 border-border bg-secondary-background p-3',
            widthClass,
            positionClass
          )}
        >
          <div className="grid gap-2 sm:grid-cols-3">
            <select
              value={form.alertType}
              onChange={(e) => updateField('alertType', e.target.value as AlertType)}
              className="h-9 rounded-base border-2 border-border bg-background px-3 text-sm"
            >
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
            <select
              value={form.cardSize}
              onChange={(e) => updateField('cardSize', e.target.value as CardSize)}
              className="h-9 rounded-base border-2 border-border bg-background px-3 text-sm"
            >
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
            </select>
            <select
              value={form.position}
              onChange={(e) => updateField('position', e.target.value as Position)}
              className="h-9 rounded-base border-2 border-border bg-background px-3 text-sm"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-1">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyInlineFormat('bold')}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyInlineFormat('italic')}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyInlineFormat('underline')}
            >
              <Underline className="h-4 w-4" />
            </Button>
          </div>
          <RichEditable
            value={form.title || ''}
            className="min-h-9 rounded-base border-2 border-border bg-secondary-background px-3 py-2 text-sm font-heading"
            onFocus={() => setActiveField('title')}
            onBlur={() => setActiveField((prev) => (prev === 'title' ? null : prev))}
            onChange={(html) => updateField('title', html)}
          />
          <RichEditable
            value={form.message || ''}
            className="min-h-24 rounded-base border-2 border-border bg-secondary-background px-3 py-2 text-sm"
            onFocus={() => setActiveField('message')}
            onBlur={() => setActiveField((prev) => (prev === 'message' ? null : prev))}
            onChange={(html) => updateField('message', html)}
          />
        </div>
      ) : null}

      {card}
    </NodeViewWrapper>
  )
}
