import {
  IconColumnInsertLeft,
  IconColumnInsertRight,
  IconColumnRemove,
  IconRowInsertBottom,
  IconRowInsertTop,
  IconRowRemove,
  IconTableOptions,
} from '@tabler/icons-react'
import { Editor } from '@tiptap/react'
import { Trash2 } from 'lucide-react'
import { NodeSelection } from 'prosemirror-state'
import type { MouseEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'

export default function TableOperationsDropdown({
  editor,
  onAddColumnBefore,
  onAddColumnAfter,
  onDeleteColumn,
  onAddRowBefore,
  onAddRowAfter,
  onDeleteRow,
  onMergeOrSplitCells,
  onDeleteTable,
}: {
  editor: Editor | null
  onAddColumnBefore: () => void
  onAddColumnAfter: () => void
  onDeleteColumn: () => void
  onAddRowBefore: () => void
  onAddRowAfter: () => void
  onDeleteRow: () => void
  onMergeOrSplitCells: () => void
  onDeleteTable: () => void
}) {
  if (!editor) return null
  const isEditable = !!editor.isEditable
  const keepEditorSelection = (e: MouseEvent) => e.preventDefault()

  const [selectionVersion, setSelectionVersion] = useState(0)

  useEffect(() => {
    const onSelectionUpdate = () => setSelectionVersion((v) => v + 1)
    const onTransaction = () => setSelectionVersion((v) => v + 1)

    editor.on('selectionUpdate', onSelectionUpdate)
    editor.on('transaction', onTransaction)

    return () => {
      editor.off('selectionUpdate', onSelectionUpdate)
      editor.off('transaction', onTransaction)
    }
  }, [editor])

  const isTableContext = useMemo(() => {
    if (
      editor.isActive('table') ||
      editor.isActive('tableCell') ||
      editor.isActive('tableHeader') ||
      editor.isActive('tableRow')
    ) {
      return true
    }

    const selection = editor.state.selection
    if (selection instanceof NodeSelection) {
      const selectedNodeName = selection.node.type.name
      if (
        selectedNodeName === 'table' ||
        selectedNodeName === 'tableRow' ||
        selectedNodeName === 'tableCell' ||
        selectedNodeName === 'tableHeader'
      ) {
        return true
      }
    }

    const from = selection.$from
    for (let depth = from.depth; depth >= 0; depth--) {
      const nodeName = from.node(depth).type.name
      if (
        nodeName === 'table' ||
        nodeName === 'tableRow' ||
        nodeName === 'tableCell' ||
        nodeName === 'tableHeader'
      ) {
        return true
      }
    }

    return false
  }, [editor, selectionVersion])

  if (!isTableContext) return null

  return (
    <DropdownMenu modal={false}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="bg-muted"
              onMouseDown={keepEditorSelection}
              disabled={!isEditable}
            >
              <IconTableOptions className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>Table Operations</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onMouseDown={keepEditorSelection} onClick={onAddColumnBefore}>
          <IconColumnInsertLeft />
          Add Column Before
        </DropdownMenuItem>
        <DropdownMenuItem onMouseDown={keepEditorSelection} onClick={onAddColumnAfter}>
          <IconColumnInsertRight />
          Add Column After
        </DropdownMenuItem>
        <DropdownMenuItem
          onMouseDown={keepEditorSelection}
          onClick={onDeleteColumn}
          className="text-red-500"
        >
          <IconColumnRemove />
          Delete Column
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onMouseDown={keepEditorSelection} onClick={onAddRowBefore}>
          <IconRowInsertTop />
          Add Row Before
        </DropdownMenuItem>
        <DropdownMenuItem onMouseDown={keepEditorSelection} onClick={onAddRowAfter}>
          <IconRowInsertBottom />
          Add Row After
        </DropdownMenuItem>
        <DropdownMenuItem
          onMouseDown={keepEditorSelection}
          onClick={onDeleteRow}
          className="text-red-500"
        >
          <IconRowRemove />
          Delete Row
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onMouseDown={keepEditorSelection} onClick={onMergeOrSplitCells}>
          Merge/Split Cells
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onMouseDown={keepEditorSelection}
          onClick={onDeleteTable}
          className="text-red-500"
        >
          <Trash2 />
          Delete Table
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
