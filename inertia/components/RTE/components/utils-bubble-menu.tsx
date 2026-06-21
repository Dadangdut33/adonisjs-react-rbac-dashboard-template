import { Editor } from '@tiptap/react'
import { AlignCenter, AlignJustify, AlignLeft, AlignRight, Redo, Undo } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'

export default function UtilsBubbleMenu({ editor }: { editor: Editor | null }) {
  if (!editor) return null
  const isEditable = !!editor.isEditable

  return (
    <>
      <div className="border-l mx-1 h-8"></div>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (editor.isActive('image')) {
                editor.chain().focus().updateImageAlign({ align: 'left' }).run()
              } else {
                editor.chain().focus().setTextAlign('left').run()
              }
            }}
            className={editor.isActive({ textAlign: 'left' }) ? 'bg-muted' : ''}
            disabled={!isEditable}
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Align Left</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (editor.isActive('image')) {
                editor.chain().focus().updateImageAlign({ align: 'center' }).run()
              } else {
                editor.chain().focus().setTextAlign('center').run()
              }
            }}
            className={editor.isActive({ textAlign: 'center' }) ? 'bg-muted' : ''}
            disabled={!isEditable}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Align Center</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (editor.isActive('image')) {
                editor.chain().focus().updateImageAlign({ align: 'right' }).run()
              } else {
                editor.chain().focus().setTextAlign('right').run()
              }
            }}
            className={editor.isActive({ textAlign: 'right' }) ? 'bg-muted' : ''}
            disabled={!isEditable}
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Align Right</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (!editor.isActive('image')) {
                editor.chain().focus().setTextAlign('justify').run()
              }
            }}
            className={editor.isActive({ textAlign: 'justify' }) ? 'bg-muted' : ''}
            disabled={!isEditable || editor.isActive('image')}
          >
            <AlignJustify className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Justify</TooltipContent>
      </Tooltip>

      <div className="border-l mx-1 h-8"></div>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!isEditable || !editor.can().chain().focus().undo().run()}
          >
            <Undo className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Undo</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!isEditable || !editor.can().chain().focus().redo().run()}
          >
            <Redo className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Redo</TooltipContent>
      </Tooltip>
    </>
  )
}
