import { VisuallyHidden } from '@mantine/core'
import * as SheetPrimitive from '@radix-ui/react-dialog'
import { ChevronDown, ChevronRight, FileText, ListTree, X } from 'lucide-react'
import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { Button } from '~/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
} from '~/components/ui/sheet'
import { cn } from '~/lib/utils'

type BlogHeadingItem = {
  id: string
  text: string
  level: number
}

type TOCNode = BlogHeadingItem & {
  children: TOCNode[]
}

type BlogHeadingHeatmapProps = {
  headings: BlogHeadingItem[]
  activeHeadingId: string | null
  onSelect: (id: string) => void
}

const buildTOCTree = (headings: BlogHeadingItem[]) => {
  const roots: TOCNode[] = []
  const stack: TOCNode[] = []
  const parentById = new Map<string, string>()

  for (const heading of headings) {
    const node: TOCNode = { ...heading, children: [] }

    while (stack.length > 0 && stack[stack.length - 1].level >= node.level) {
      stack.pop()
    }

    const parent = stack[stack.length - 1]
    if (parent) {
      parent.children.push(node)
      parentById.set(node.id, parent.id)
    } else {
      roots.push(node)
    }

    stack.push(node)
  }

  const parentIds = new Set<string>()
  const collectParentIds = (nodes: TOCNode[]) => {
    for (const node of nodes) {
      if (node.children.length > 0) {
        parentIds.add(node.id)
        collectParentIds(node.children)
      }
    }
  }

  collectParentIds(roots)

  return { roots, parentById, parentIds }
}

export default function BlogHeadingTOC({
  headings,
  activeHeadingId,
  onSelect,
}: BlogHeadingHeatmapProps) {
  if (headings.length === 0) return null

  const [open, setOpen] = useState(false)
  const [expandedById, setExpandedById] = useState<Record<string, boolean>>({})
  const { roots, parentById, parentIds } = useMemo(() => buildTOCTree(headings), [headings])

  useEffect(() => {
    setExpandedById((prev) => {
      const next: Record<string, boolean> = {}
      for (const id of parentIds) {
        next[id] = prev[id] ?? true
      }
      return next
    })
  }, [parentIds])

  useEffect(() => {
    if (!activeHeadingId) return

    setExpandedById((prev) => {
      let current = parentById.get(activeHeadingId)
      let hasChanges = false
      const next = { ...prev }

      while (current) {
        if (!next[current]) {
          next[current] = true
          hasChanges = true
        }
        current = parentById.get(current)
      }

      return hasChanges ? next : prev
    })
  }, [activeHeadingId, parentById])

  const toggleExpand = (id: string) => {
    setExpandedById((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const renderItems = (closeOnSelect = false) => (
    <div className="max-h-[65vh] space-y-1 overflow-y-auto px-1">
      {renderNodeList(roots, closeOnSelect)}
    </div>
  )

  const renderNodeList = (nodes: TOCNode[], closeOnSelect: boolean, depth = 0): ReactNode => {
    return nodes.map((node) => {
      const isActive = activeHeadingId === node.id
      const hasChildren = node.children.length > 0
      const isExpanded = hasChildren ? (expandedById[node.id] ?? true) : false
      const paddingLeft = 8 + depth * 14

      return (
        <div key={node.id} className="space-y-1">
          <div
            className={`group relative flex w-full items-center gap-2 rounded-base border border-transparent py-1 pr-2 text-left text-xs transition ${
              isActive
                ? 'border-border bg-main/15 font-medium text-foreground'
                : 'hover:bg-main/10 text-foreground/80'
            }`}
            style={{ paddingLeft: `${paddingLeft}px` }}
          >
            {hasChildren ? (
              <button
                type="button"
                onClick={() => toggleExpand(node.id)}
                className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm text-foreground/70 transition hover:bg-main/15 hover:text-foreground"
                aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${node.text}`}
                aria-expanded={isExpanded}
              >
                {isExpanded ? (
                  <ChevronDown className="size-3.5" />
                ) : (
                  <ChevronRight className="size-3.5" />
                )}
              </button>
            ) : (
              <span
                className="inline-flex h-4 w-4 shrink-0 items-center justify-center text-foreground/45"
                aria-hidden="true"
              >
                <FileText />
              </span>
            )}

            <button
              type="button"
              onClick={() => {
                onSelect(node.id)
                if (closeOnSelect) setOpen(false)
              }}
              className="min-w-0 flex-1 text-left pr-2 line-clamp-1"
              title={node.text}
            >
              <span className="truncate">{node.text}</span>
            </button>

            <span
              className={`h-3 rounded-full transition-all ${
                isActive ? 'w-3 bg-main' : 'w-1.5 bg-foreground/30 group-hover:bg-foreground/50'
              }`}
            />
          </div>

          {hasChildren && isExpanded
            ? renderNodeList(node.children, closeOnSelect, depth + 1)
            : null}
        </div>
      )
    })
  }

  return (
    <>
      <div className="fixed right-4 top-24 z-40 hidden w-64 xl:block">
        <div className="rounded-base border-2 border-border bg-secondary-background py-3 shadow-shadow">
          <p className="px-3 mb-2 text-xs font-heading uppercase tracking-wide text-foreground/70">
            On this page
          </p>
          {renderItems()}
        </div>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            type="button"
            variant="noShadow"
            size="3xl"
            className="fixed right-0 top-1/2 z-50 w-[40px] -translate-y-1/2 rounded-r-none border-r-0 px-2.5 shadow-shadow xl:hidden"
            aria-label="Open page sections"
          >
            <ListTree className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetPortal>
          <SheetOverlay />
          <VisuallyHidden>
            <SheetTitle>Heatmap</SheetTitle>
          </VisuallyHidden>
          <SheetPrimitive.Content
            className={cn(
              'data-[state=open]:animate-in data-[state=closed]:animate-out fixed inset-y-0 right-0 z-50 w-[88vw] max-w-sm',
              'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
              'bg-transparent border-0 p-3 font-geistmono'
            )}
            aria-describedby="Heatmap"
          >
            <div className="mt-20 rounded-base border-2 border-border bg-secondary-background p-3 shadow-shadow">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-xs font-heading uppercase tracking-wide text-foreground/70">
                  On This Page
                </p>
                <SheetClose asChild>
                  <Button type="button" size="icon" variant="neutral" className="h-7 w-7">
                    <X className="size-4" />
                  </Button>
                </SheetClose>
              </div>
              {renderItems(true)}
            </div>
          </SheetPrimitive.Content>
        </SheetPortal>
      </Sheet>
    </>
  )
}
