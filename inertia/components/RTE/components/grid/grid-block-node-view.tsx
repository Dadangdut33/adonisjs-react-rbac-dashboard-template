import { NumberInput, Select } from '@mantine/core'
import { type NodeViewProps, NodeViewWrapper } from '@tiptap/react'
import DOMPurify from 'dompurify'
import { Bold, GripHorizontal, Italic, Pencil, Rows3, Save, Underline, X } from 'lucide-react'
import { type MouseEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { cn } from '~/lib/utils'

type CardSize = 'sm' | 'md' | 'lg'
type Position = 'left' | 'center' | 'right'
type MobileBehavior = 'scroll' | 'row'
type GridStyle = 'card' | 'plain'
type GridItemData = {
  icon: string
  title: string
  description: string
}

type GridBlockAttrs = {
  columns?: number
  itemCount?: number
  itemMinWidth?: number
  gap?: number
  mobileBehavior?: MobileBehavior
  cardSize?: CardSize
  position?: Position
  itemContents?: string[]
  itemData?: GridItemData[]
  gridStyle?: GridStyle
  textColor?: string | null
}

type FormState = {
  columns: string
  itemCount: string
  itemMinWidth: string
  gap: string
  mobileBehavior: MobileBehavior
  cardSize: CardSize
  position: Position
  itemData: GridItemData[]
  gridStyle: GridStyle
  textColor: string
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

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

const hasRichTextContent = (html: string) => {
  const plain = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim()
  return plain.length > 0
}

const normalizeItemData = (itemCount: number, values?: GridItemData[], fallback?: string[]) =>
  Array.from({ length: itemCount }, (_, index) => ({
    icon: values?.[index]?.icon ?? '✨',
    title: normalizeRichText(values?.[index]?.title, fallback?.[index] ?? `Item ${index + 1}`),
    description: normalizeRichText(values?.[index]?.description, '', true),
  }))

const attrsToForm = (attrs: GridBlockAttrs): FormState => ({
  columns: String(attrs.columns || 3),
  itemCount: String(attrs.itemCount || 6),
  itemMinWidth: String(attrs.itemMinWidth || 220),
  gap: String(attrs.gap || 12),
  mobileBehavior: attrs.mobileBehavior || 'scroll',
  cardSize: attrs.cardSize || 'md',
  position: attrs.position || 'center',
  itemData: normalizeItemData(attrs.itemCount || 6, attrs.itemData, attrs.itemContents),
  gridStyle: attrs.gridStyle || 'card',
  textColor: attrs.textColor || '#111827',
})

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

export default function GridBlockNodeView({ node, editor, updateAttributes }: NodeViewProps) {
  const attrs = node.attrs as GridBlockAttrs
  const [isEditable, setIsEditable] = useState(!!editor?.isEditable)
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState<FormState>(() => attrsToForm(attrs))
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const [activeEditor, setActiveEditor] = useState<{ index: number; field: 'title' | 'description' } | null>(null)
  const dragStateRef = useRef<{ isDown: boolean; startX: number; startScrollLeft: number }>({
    isDown: false,
    startX: 0,
    startScrollLeft: 0,
  })

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
  }, [
    attrs.columns,
    attrs.itemCount,
    attrs.itemMinWidth,
    attrs.gap,
    attrs.mobileBehavior,
    attrs.cardSize,
    attrs.position,
    attrs.gridStyle,
    attrs.textColor,
    isEditing,
  ])

  const columns = clamp(
    Number.parseInt(isEditing ? form.columns : String(attrs.columns || 3), 10) || 3,
    1,
    6
  )
  const itemCount = clamp(
    Number.parseInt(isEditing ? form.itemCount : String(attrs.itemCount || 6), 10) || 6,
    1,
    24
  )
  const itemMinWidth = clamp(
    Number.parseInt(isEditing ? form.itemMinWidth : String(attrs.itemMinWidth || 220), 10) || 220,
    120,
    500
  )
  const gap = clamp(
    Number.parseInt(isEditing ? form.gap : String(attrs.gap || 12), 10) || 12,
    4,
    32
  )
  const mobileBehavior = (
    isEditing ? form.mobileBehavior : attrs.mobileBehavior || 'scroll'
  ) as MobileBehavior
  const cardSize = (isEditing ? form.cardSize : attrs.cardSize || 'md') as CardSize
  const position = (isEditing ? form.position : attrs.position || 'center') as Position
  const gridStyle = (isEditing ? form.gridStyle : attrs.gridStyle || 'card') as GridStyle
  const textColor = (isEditing ? form.textColor : attrs.textColor || '#111827') as string

  const widthClass =
    cardSize === 'sm'
      ? 'w-[24rem] max-w-full'
      : cardSize === 'lg'
        ? 'w-full'
        : 'w-[42rem] max-w-full'
  const positionClass =
    position === 'left' ? 'mr-auto' : position === 'right' ? 'ml-auto' : 'mx-auto'

  const items = useMemo(() => Array.from({ length: itemCount }, (_, i) => i + 1), [itemCount])
  const displayItemData = useMemo(
    () =>
      normalizeItemData(
        itemCount,
        isEditing ? form.itemData : Array.isArray(attrs.itemData) ? attrs.itemData : [],
        Array.isArray(attrs.itemContents) ? attrs.itemContents : []
      ),
    [attrs.itemContents, attrs.itemData, form.itemData, isEditing, itemCount]
  )

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const updateItemData = <K extends keyof GridItemData>(
    index: number,
    key: K,
    value: GridItemData[K]
  ) => {
    setForm((prev) => {
      const next = [...prev.itemData]
      next[index] = { ...next[index], [key]: value }
      return { ...prev, itemData: next }
    })
  }

  const applyInlineFormat = (command: 'bold' | 'italic' | 'underline') => {
    if (!isEditable || !activeEditor) return
    document.execCommand(command, false)
  }

  const ensureItemDataLength = (count: number) => {
    setForm((prev) => ({
      ...prev,
      itemData: normalizeItemData(count, prev.itemData),
    }))
  }

  const saveManualEdit = () => {
    if (!isEditable) return

    updateAttributes({
      columns,
      itemCount,
      itemMinWidth,
      gap,
      mobileBehavior,
      cardSize,
      position,
      itemData: normalizeItemData(itemCount, form.itemData),
      gridStyle,
      textColor,
    })
    setIsEditing(false)
  }

  const cancelManualEdit = () => {
    setForm(attrsToForm(attrs))
    setIsEditing(false)
  }

  const handleScrollMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    if (!scrollContainerRef.current) return

    dragStateRef.current.isDown = true
    dragStateRef.current.startX = event.clientX
    dragStateRef.current.startScrollLeft = scrollContainerRef.current.scrollLeft
  }

  const handleScrollMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!dragStateRef.current.isDown) return
    if (!scrollContainerRef.current) return

    event.preventDefault()
    const walk = event.clientX - dragStateRef.current.startX
    scrollContainerRef.current.scrollLeft = dragStateRef.current.startScrollLeft - walk
  }

  const endScrollDrag = () => {
    dragStateRef.current.isDown = false
  }

  const editorMeta = isEditable ? (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <div className="rounded-base border-2 border-border bg-secondary-background p-2">
          <Rows3 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-heading">Grid Block</p>
          <p className="text-xs text-muted-foreground">
            {columns} columns • {itemCount} items • {mobileBehavior} • {gridStyle}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="neutral">{itemMinWidth}px min</Badge>
        <Badge variant="neutral">{gap}px gap</Badge>
      </div>
    </div>
  ) : null

  const gridItems =
    mobileBehavior === 'scroll' ? (
      <div
        ref={scrollContainerRef}
        className="rte-grid-scroll overflow-x-auto pb-1 cursor-grab active:cursor-grabbing"
        onMouseDown={handleScrollMouseDown}
        onMouseMove={handleScrollMouseMove}
        onMouseUp={endScrollDrag}
        onMouseLeave={endScrollDrag}
        style={{ color: textColor }}
      >
        <div className="flex" style={{ gap }}>
          {items.map((item, index) => (
            <div
              key={item}
              className="shrink-0 rounded-base border-2 border-border bg-secondary-background p-4 text-center"
              style={{ width: itemMinWidth }}
            >
              <GripHorizontal className="mx-auto mb-2 h-4 w-4 text-muted-foreground" />
              <p className="mb-1 text-2xl leading-none">{displayItemData[index].icon}</p>
              <p
                className="text-sm font-heading"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(displayItemData[index].title),
                }}
              />
              {hasRichTextContent(displayItemData[index].description) ? (
                <p
                  className="mt-1 text-xs opacity-80"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(displayItemData[index].description),
                  }}
                />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    ) : (
      <div className="flex flex-wrap" style={{ gap, color: textColor }}>
        {items.map((item, index) => (
          <div
            key={item}
            className="rounded-base border-2 border-border bg-secondary-background p-4 text-center"
            style={{
              minWidth: itemMinWidth,
              flex: `1 1 ${itemMinWidth}px`,
              maxWidth: `calc((100% - ${(columns - 1) * gap}px) / ${columns})`,
            }}
          >
            <GripHorizontal className="mx-auto mb-2 h-4 w-4 text-muted-foreground" />
            <p className="mb-1 text-2xl leading-none">{displayItemData[index].icon}</p>
            <p
              className="text-sm font-heading"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(displayItemData[index].title),
              }}
            />
            {hasRichTextContent(displayItemData[index].description) ? (
              <p
                className="mt-1 text-xs opacity-80"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(displayItemData[index].description),
                }}
              />
            ) : null}
          </div>
        ))}
      </div>
    )

  const gridContent = (
    <>
      {editorMeta}
      {gridItems}
    </>
  )

  const gridContainer =
    gridStyle === 'plain' ? (
      <div className={cn('space-y-3 py-1', widthClass, positionClass)}>{gridContent}</div>
    ) : (
      <Card className={cn('gap-0 overflow-hidden py-4', widthClass, positionClass)}>
        <CardContent className="space-y-3 px-4">{gridContent}</CardContent>
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
          <div className="grid gap-2 sm:grid-cols-4">
            <NumberInput
              min={1}
              max={20}
              value={form.columns}
              onChange={(e) => updateField('columns', e.toString())}
              placeholder="Columns"
              clampBehavior="strict"
              stepHoldDelay={500}
              stepHoldInterval={(t) => Math.max(1000 / t ** 2, 25)}
            />
            <NumberInput
              min={1}
              max={24}
              value={form.itemCount}
              onChange={(e) => {
                const nextValue = e.toString()
                updateField('itemCount', nextValue)
                const nextCount = clamp(Number.parseInt(nextValue, 10) || 6, 1, 24)
                ensureItemDataLength(nextCount)
              }}
              placeholder="Items"
              clampBehavior="strict"
              stepHoldDelay={500}
              stepHoldInterval={(t) => Math.max(1000 / t ** 2, 25)}
            />
            <NumberInput
              min={120}
              max={500}
              value={form.itemMinWidth}
              onChange={(e) => updateField('itemMinWidth', e.toString())}
              placeholder="Min Width"
              clampBehavior="strict"
              stepHoldDelay={500}
              stepHoldInterval={(t) => Math.max(1000 / t ** 2, 25)}
            />
            <NumberInput
              min={4}
              max={32}
              value={form.gap}
              onChange={(e) => updateField('gap', e.toString())}
              placeholder="Gap"
              clampBehavior="strict"
              stepHoldDelay={500}
              stepHoldInterval={(t) => Math.max(1000 / t ** 2, 25)}
            />
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <Select
              value={form.mobileBehavior}
              onChange={(e) => updateField('mobileBehavior', e as MobileBehavior)}
              data={[
                {
                  value: 'scroll',
                  label: 'Scrollable On Small Width',
                },
                {
                  value: 'row',
                  label: 'Wrap To Row On Small Width',
                },
              ]}
              allowDeselect={false}
            />
            <Select
              value={form.cardSize}
              onChange={(e) => updateField('cardSize', e as CardSize)}
              data={[
                {
                  value: 'sm',
                  label: 'Small Cards',
                },
                {
                  value: 'md',
                  label: 'Medium Cards',
                },
                {
                  value: 'lg',
                  label: 'Large Cards',
                },
              ]}
              allowDeselect={false}
            />
            <Select
              value={form.position}
              onChange={(e) => updateField('position', e as Position)}
              data={[
                {
                  value: 'left',
                  label: 'Left',
                },
                {
                  value: 'center',
                  label: 'Center',
                },
                {
                  value: 'right',
                  label: 'Right',
                },
              ]}
              allowDeselect={false}
            />
            <Select
              value={form.gridStyle}
              onChange={(e) => updateField('gridStyle', e as GridStyle)}
              data={[
                {
                  value: 'card',
                  label: 'Card Grid',
                },
                {
                  value: 'plain',
                  label: 'Plain Grid',
                },
              ]}
              allowDeselect={false}
            />
            <Input
              type="color"
              value={form.textColor}
              onChange={(e) => updateField('textColor', e.target.value)}
              className="h-9 cursor-pointer"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {displayItemData.map((item, index) => (
              <div
                key={`grid-item-data-${index + 1}`}
                className="space-y-2 rounded-base border-2 border-border bg-background p-3"
              >
                <Input
                  value={item.icon}
                  onChange={(e) => updateItemData(index, 'icon', e.target.value)}
                  placeholder={`Item ${index + 1} icon (eg. ✨)`}
                />
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
                  value={item.title || ''}
                  className="min-h-9 rounded-base border-2 border-border bg-secondary-background px-3 py-2 text-sm font-heading"
                  onFocus={() => setActiveEditor({ index, field: 'title' })}
                  onBlur={() => {
                    setActiveEditor((prev) =>
                      prev?.index === index && prev.field === 'title' ? null : prev
                    )
                  }}
                  onChange={(html) => updateItemData(index, 'title', html)}
                />
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
                  value={item.description || ''}
                  className="min-h-24 rounded-base border-2 border-border bg-secondary-background px-3 py-2 text-sm"
                  onFocus={() => setActiveEditor({ index, field: 'description' })}
                  onBlur={() => {
                    setActiveEditor((prev) =>
                      prev?.index === index && prev.field === 'description' ? null : prev
                    )
                  }}
                  onChange={(html) => updateItemData(index, 'description', html)}
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {gridContainer}
    </NodeViewWrapper>
  )
}
