import { Editor } from '@tiptap/react'
import { Table2 } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'

export default function TableInsertDialogButton({
  editor,
  open,
  onOpenChange,
  rows,
  cols,
  withHeaderRow,
  setRows,
  setCols,
  setWithHeaderRow,
  onInsert,
}: {
  editor: Editor | null
  open: boolean
  onOpenChange: (open: boolean) => void
  rows: number
  cols: number
  withHeaderRow: boolean
  setRows: (value: number) => void
  setCols: (value: number) => void
  setWithHeaderRow: (value: boolean) => void
  onInsert: () => void
}) {
  if (!editor) return null
  const isEditable = !!editor.isEditable

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(true)}
            disabled={!isEditable}
          >
            <Table2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Insert Table</TooltipContent>
      </Tooltip>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Insert Table</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="rows">Rows</Label>
              <Input
                id="rows"
                type="number"
                min="1"
                max="10"
                value={rows}
                onChange={(e) => setRows(Number.parseInt(e.target.value) || 3)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cols">Columns</Label>
              <Input
                id="cols"
                type="number"
                min="1"
                max="10"
                value={cols}
                onChange={(e) => setCols(Number.parseInt(e.target.value) || 3)}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="withHeaderRow"
              checked={withHeaderRow}
              onChange={(e) => setWithHeaderRow(e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="withHeaderRow">Include header row</Label>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onInsert}>Insert Table</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
