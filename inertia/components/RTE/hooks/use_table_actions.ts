import { Editor } from '@tiptap/react'
import { useCallback, useState } from 'react'

export default function useTableActions(editor: Editor | null) {
  const [tableDialogOpen, setTableDialogOpen] = useState(false)
  const [rows, setRows] = useState(3)
  const [cols, setCols] = useState(3)
  const [withHeaderRow, setWithHeaderRow] = useState(true)

  const insertTable = useCallback(() => {
    if (!editor) return

    editor.chain().focus().insertTable({ rows, cols, withHeaderRow }).run()
    setTableDialogOpen(false)
  }, [editor, rows, cols, withHeaderRow])

  const addColumnBefore = useCallback(() => {
    if (!editor) return
    editor.chain().focus().addColumnBefore().run()
  }, [editor])

  const addColumnAfter = useCallback(() => {
    if (!editor) return
    editor.chain().focus().addColumnAfter().run()
  }, [editor])

  const deleteColumn = useCallback(() => {
    if (!editor) return
    editor.chain().focus().deleteColumn().run()
  }, [editor])

  const addRowBefore = useCallback(() => {
    if (!editor) return
    editor.chain().focus().addRowBefore().run()
  }, [editor])

  const addRowAfter = useCallback(() => {
    if (!editor) return
    editor.chain().focus().addRowAfter().run()
  }, [editor])

  const deleteRow = useCallback(() => {
    if (!editor) return
    editor.chain().focus().deleteRow().run()
  }, [editor])

  const deleteTable = useCallback(() => {
    if (!editor) return
    editor.chain().focus().deleteTable().run()
  }, [editor])

  const mergeOrSplitCells = useCallback(() => {
    if (!editor) return

    if (editor.can().mergeCells()) {
      editor.chain().focus().mergeCells().run()
    } else if (editor.can().splitCell()) {
      editor.chain().focus().splitCell().run()
    }
  }, [editor])

  return {
    tableDialogOpen,
    setTableDialogOpen,
    rows,
    setRows,
    cols,
    setCols,
    withHeaderRow,
    setWithHeaderRow,
    insertTable,
    addColumnBefore,
    addColumnAfter,
    deleteColumn,
    addRowBefore,
    addRowAfter,
    deleteRow,
    deleteTable,
    mergeOrSplitCells,
  }
}
