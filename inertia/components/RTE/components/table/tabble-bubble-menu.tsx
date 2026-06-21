import {
  IconColumnInsertLeft,
  IconColumnInsertRight,
  IconColumnRemove,
  IconRowInsertBottom,
  IconRowInsertTop,
  IconRowRemove,
} from '@tabler/icons-react'
import { Trash2 } from 'lucide-react'
import type { MouseEvent } from 'react'
import { Button } from '~/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'

export default function TableBubbleMenu({
  onAddColumnBefore,
  onAddColumnAfter,
  onDeleteColumn,
  onAddRowBefore,
  onAddRowAfter,
  onDeleteRow,
  onMergeOrSplitCells,
  onDeleteTable,
}: {
  onAddColumnBefore: () => void
  onAddColumnAfter: () => void
  onDeleteColumn: () => void
  onAddRowBefore: () => void
  onAddRowAfter: () => void
  onDeleteRow: () => void
  onMergeOrSplitCells: () => void
  onDeleteTable: () => void
}) {
  const keepSelection = (e: MouseEvent) => e.preventDefault()

  return (
    <div className="flex items-center gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onMouseDown={keepSelection}
            onClick={onAddColumnBefore}
          >
            <IconColumnInsertLeft />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Add Column Before</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onMouseDown={keepSelection}
            onClick={onAddColumnAfter}
          >
            <IconColumnInsertRight />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Add Column After</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onMouseDown={keepSelection} onClick={onDeleteColumn}>
            <IconColumnRemove className="text-red-500" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Delete Column</TooltipContent>
      </Tooltip>

      <div className="border-l mx-1 h-7" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onMouseDown={keepSelection} onClick={onAddRowBefore}>
            <IconRowInsertTop />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Add Row Before</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onMouseDown={keepSelection} onClick={onAddRowAfter}>
            <IconRowInsertBottom />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Add Row After</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onMouseDown={keepSelection} onClick={onDeleteRow}>
            <IconRowRemove className="text-red-500" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Delete Row</TooltipContent>
      </Tooltip>

      <div className="border-l mx-1 h-7" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onMouseDown={keepSelection}
            onClick={onMergeOrSplitCells}
          >
            Merge/Split
          </Button>
        </TooltipTrigger>
        <TooltipContent>Merge or Split Cells</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-red-500"
            onMouseDown={keepSelection}
            onClick={onDeleteTable}
          >
            <Trash2 />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Delete Table</TooltipContent>
      </Tooltip>
    </div>
  )
}
