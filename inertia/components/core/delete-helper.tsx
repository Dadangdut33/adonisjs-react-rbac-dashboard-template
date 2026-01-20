import { Trash2 } from 'lucide-react'

export function GeneriDeleteTitle({ title, bulk = false }: { title?: string; bulk?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <Trash2 className="size-5 text-red-400" />
      <span>{title || bulk ? 'Delete Selected Items' : 'Delete Item'}</span>
    </div>
  )
}

export function GenericBulkDeleteDescription({
  children,
  length,
}: {
  children: React.ReactNode
  length: number
}) {
  return (
    <div className="overflow-x-scroll">
      Are you sure you want to delete {length} selected items? This action cannot be undone.
      <div className="mt-2 bg-slate-900 rounded-lg p-6 font-mono text-sm text-emerald-400 border-2 border-emerald-500 max-h-[250px] overflow-auto">
        {children}
      </div>
    </div>
  )
}
