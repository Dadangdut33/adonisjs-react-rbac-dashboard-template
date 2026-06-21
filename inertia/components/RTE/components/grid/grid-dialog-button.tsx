import { Editor } from '@tiptap/core'
import { Grid3x3 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'

type CardSize = 'sm' | 'md' | 'lg'
type Position = 'left' | 'center' | 'right'
type MobileBehavior = 'scroll' | 'row'
type GridStyle = 'card' | 'plain'

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export default function GridDialogButton({ editor }: { editor: Editor | null }) {
  if (!editor) return null
  const isEditable = !!editor.isEditable
  const [open, setOpen] = useState(false)

  const [columns, setColumns] = useState('3')
  const [itemCount, setItemCount] = useState('6')
  const [itemMinWidth, setItemMinWidth] = useState('220')
  const [gap, setGap] = useState('12')
  const [mobileBehavior, setMobileBehavior] = useState<MobileBehavior>('scroll')
  const [cardSize, setCardSize] = useState<CardSize>('md')
  const [position, setPosition] = useState<Position>('center')
  const [gridStyle, setGridStyle] = useState<GridStyle>('card')
  const [textColor, setTextColor] = useState('#111827')

  const insertGrid = () => {
    if (!isEditable) return

    const payload = [
      {
        type: 'gridBlock',
        attrs: {
          columns: clamp(Number.parseInt(columns, 10) || 3, 1, 6),
          itemCount: clamp(Number.parseInt(itemCount, 10) || 6, 1, 24),
          itemMinWidth: clamp(Number.parseInt(itemMinWidth, 10) || 220, 120, 500),
          gap: clamp(Number.parseInt(gap, 10) || 12, 4, 32),
          mobileBehavior,
          cardSize,
          position,
          gridStyle,
          textColor,
        },
      },
      { type: 'paragraph' },
    ]

    const insertedAtSelection = editor
      .chain()
      .focus()
      .insertContent(payload)
      .run()

    if (insertedAtSelection) {
      setOpen(false)
      return
    }

    const insertedAtEnd = editor
      .chain()
      .focus()
      .insertContentAt(editor.state.doc.content.size, payload)
      .run()

    if (insertedAtEnd) {
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" disabled={!isEditable}>
              <Grid3x3 className="h-4 w-4" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>Add Grid</TooltipContent>
      </Tooltip>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Grid Block</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label>Columns</Label>
              <Input
                type="number"
                min={1}
                max={6}
                value={columns}
                onChange={(e) => setColumns(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Items</Label>
              <Input
                type="number"
                min={1}
                max={24}
                value={itemCount}
                onChange={(e) => setItemCount(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Min Width</Label>
              <Input
                type="number"
                min={120}
                max={500}
                value={itemMinWidth}
                onChange={(e) => setItemMinWidth(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Gap</Label>
              <Input
                type="number"
                min={4}
                max={32}
                value={gap}
                onChange={(e) => setGap(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label>Small Width</Label>
              <select
                value={mobileBehavior}
                onChange={(e) => setMobileBehavior(e.target.value as MobileBehavior)}
                className="h-9 rounded-base border-2 border-border bg-secondary-background px-3 text-sm"
              >
                <option value="scroll">Scrollable</option>
                <option value="row">Wrap To Row</option>
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label>Size</Label>
              <select
                value={cardSize}
                onChange={(e) => setCardSize(e.target.value as CardSize)}
                className="h-9 rounded-base border-2 border-border bg-secondary-background px-3 text-sm"
              >
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label>Position</Label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value as Position)}
                className="h-9 rounded-base border-2 border-border bg-secondary-background px-3 text-sm"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label>Grid Look</Label>
              <select
                value={gridStyle}
                onChange={(e) => setGridStyle(e.target.value as GridStyle)}
                className="h-9 rounded-base border-2 border-border bg-secondary-background px-3 text-sm"
              >
                <option value="card">Card</option>
                <option value="plain">Plain</option>
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label>Text Color</Label>
              <Input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="h-9 cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={insertGrid}>Add Grid</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
