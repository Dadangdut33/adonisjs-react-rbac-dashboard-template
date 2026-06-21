import { Editor } from '@tiptap/core'
import { PencilRuler } from 'lucide-react'
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
type DisplayMode = 'canvas' | 'image'
type Position = 'left' | 'center' | 'right'

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export default function ExcalidrawDialogButton({ editor }: { editor: Editor | null }) {
  if (!editor) return null
  const isEditable = !!editor.isEditable
  const [open, setOpen] = useState(false)
  const [cardSize, setCardSize] = useState<CardSize>('lg')
  const [displayMode, setDisplayMode] = useState<DisplayMode>('canvas')
  const [autoScaleOnNarrow, setAutoScaleOnNarrow] = useState(false)
  const [position, setPosition] = useState<Position>('center')
  const [height, setHeight] = useState('460')

  const insertExcalidraw = () => {
    if (!isEditable) return

    const payload = [
      {
        type: 'excalidrawBlock',
        attrs: {
          cardSize,
          displayMode,
          autoScaleOnNarrow,
          position,
          height: clamp(Number.parseInt(height, 10) || 460, 280, 900),
          sceneData: JSON.stringify({ elements: [], appState: {}, files: {} }),
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
              <PencilRuler className="h-4 w-4" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>Add Excalidraw</TooltipContent>
      </Tooltip>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Excalidraw Block</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2 sm:grid-cols-2">
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
              <Label>Mode</Label>
              <select
                value={displayMode}
                onChange={(e) => setDisplayMode(e.target.value as DisplayMode)}
                className="h-9 rounded-base border-2 border-border bg-secondary-background px-3 text-sm"
              >
                <option value="canvas">Canvas</option>
                <option value="image">Image-like</option>
              </select>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
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
              <Label>Small Width</Label>
              <select
                value={autoScaleOnNarrow ? 'auto-scale' : 'overflow'}
                onChange={(e) => setAutoScaleOnNarrow(e.target.value === 'auto-scale')}
                className="h-9 rounded-base border-2 border-border bg-secondary-background px-3 text-sm"
              >
                <option value="overflow">Allow Overflow</option>
                <option value="auto-scale">Auto Scale</option>
              </select>
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label>Canvas Height</Label>
            <Input
              type="number"
              min={280}
              max={900}
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Allowed range: 280px - 900px</p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={insertExcalidraw}>Add Excalidraw</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
