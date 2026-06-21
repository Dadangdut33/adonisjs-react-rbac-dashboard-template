import { Editor } from '@tiptap/core'
import { AlertTriangle } from 'lucide-react'
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
import { Textarea } from '~/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'

type AlertType = 'info' | 'success' | 'warning' | 'error'
type CardSize = 'sm' | 'md' | 'lg'
type Position = 'left' | 'center' | 'right'

export default function AlertDialogButton({ editor }: { editor: Editor | null }) {
  if (!editor) return null
  const isEditable = !!editor.isEditable

  const [alertType, setAlertType] = useState<AlertType>('info')
  const [title, setTitle] = useState('Info')
  const [message, setMessage] = useState('')
  const [cardSize, setCardSize] = useState<CardSize>('md')
  const [position, setPosition] = useState<Position>('center')

  const insertAlert = () => {
    if (!isEditable) return

    editor
      .chain()
      .focus()
      .insertContent([
        {
          type: 'alertBlock',
          attrs: {
            alertType,
            title: title.trim() || 'Info',
            message: message.trim(),
            cardSize,
            position,
          },
        },
        { type: 'paragraph' },
      ])
      .run()
  }

  return (
    <Dialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" disabled={!isEditable}>
              <AlertTriangle className="h-4 w-4" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>Add Alert</TooltipContent>
      </Tooltip>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Alert</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="grid gap-1.5">
              <Label>Type</Label>
              <select
                value={alertType}
                onChange={(e) => setAlertType(e.target.value as AlertType)}
                className="h-9 rounded-base border-2 border-border bg-secondary-background px-3 text-sm"
              >
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
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
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="alert-title">Title</Label>
            <Input
              id="alert-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Alert title"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="alert-message">Message</Label>
            <Textarea
              id="alert-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Alert message..."
              rows={4}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={insertAlert}>Add Alert</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}
