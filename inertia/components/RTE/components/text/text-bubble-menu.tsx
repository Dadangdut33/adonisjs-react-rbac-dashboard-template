import { Editor } from '@tiptap/react'
import {
  Bold,
  Code,
  Droplet,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Italic,
  List,
  ListOrdered,
  Pilcrow,
  SquareCode,
} from 'lucide-react'
import { useMemo } from 'react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'

export default function TextBubbleMenu({ editor }: { editor: Editor | null }) {
  if (!editor) return null
  const isEditable = !!editor.isEditable
  const activeColor = (editor.getAttributes('textColor')?.color as string | undefined) || ''
  const colorSwatches = useMemo(
    () => ['#ef4444', '#f97316', '#eab308', '#22c55e', '#0ea5e9', '#3b82f6', '#8b5cf6', '#f43f5e'],
    []
  )

  const applyColor = (color: string) => {
    if (!isEditable) return
    editor.chain().focus().setMark('textColor', { color }).run()
  }

  const clearColor = () => {
    if (!isEditable) return
    editor.chain().focus().unsetMark('textColor').run()
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!isEditable || !editor.can().chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'bg-muted' : ''}
          >
            <Bold className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Bold</TooltipContent>
      </Tooltip>

      <Popover>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!isEditable} className="relative">
                <Droplet className="h-4 w-4" />
                <span
                  className="absolute -bottom-0.5 left-1/2 h-1.5 w-4 -translate-x-1/2 rounded-full border border-border"
                  style={{ backgroundColor: activeColor || '#9ca3af' }}
                />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>Text Color</TooltipContent>
        </Tooltip>
        <PopoverContent className="w-56">
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-2">
              {colorSwatches.map((swatch) => (
                <button
                  key={swatch}
                  type="button"
                  aria-label={`Set color ${swatch}`}
                  className="h-7 w-7 rounded-md border-2 border-border"
                  style={{ backgroundColor: swatch }}
                  onClick={() => applyColor(swatch)}
                />
              ))}
            </div>
            <Input
              type="color"
              value={activeColor || '#000000'}
              onChange={(event) => applyColor(event.target.value)}
              className="h-9 w-full cursor-pointer"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={clearColor}
            >
              Clear Color
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!isEditable || !editor.can().chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'bg-muted' : ''}
          >
            <Italic className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Italic</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleCode().run()}
            disabled={!isEditable || !editor.can().chain().focus().toggleCode().run()}
            className={editor.isActive('code') ? 'bg-muted' : ''}
          >
            <Code className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Inline Code</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            disabled={!isEditable}
            className={editor.isActive('codeBlock') ? 'bg-muted' : ''}
          >
            <SquareCode className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Code Block</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().setHeading({ level: 1 }).run()}
            className={editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}
            disabled={!isEditable || !editor.can().chain().focus().setHeading({ level: 1 }).run()}
          >
            <Heading1 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Heading 1</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().setHeading({ level: 2 }).run()}
            className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}
            disabled={!isEditable || !editor.can().chain().focus().setHeading({ level: 2 }).run()}
          >
            <Heading2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Heading 2</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().setHeading({ level: 3 }).run()}
            className={editor.isActive('heading', { level: 3 }) ? 'bg-muted' : ''}
            disabled={!isEditable || !editor.can().chain().focus().setHeading({ level: 3 }).run()}
          >
            <Heading3 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Heading 3</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().setHeading({ level: 4 }).run()}
            className={editor.isActive('heading', { level: 4 }) ? 'bg-muted' : ''}
            disabled={!isEditable || !editor.can().chain().focus().setHeading({ level: 4 }).run()}
          >
            <Heading4 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Heading 4</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={editor.isActive('paragraph') ? 'bg-muted' : ''}
            disabled={!isEditable || !editor.can().chain().focus().setParagraph().run()}
          >
            <Pilcrow className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Paragraph</TooltipContent>
      </Tooltip>

      <div className="border-l mx-1 h-8"></div>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'bg-muted' : ''}
            disabled={!isEditable || !editor.can().chain().focus().toggleBulletList().run()}
          >
            <List className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Bullet List</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'bg-muted' : ''}
            disabled={!isEditable || !editor.can().chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Ordered List</TooltipContent>
      </Tooltip>
    </>
  )
}
