import { Editor } from '@tiptap/react'
import { LinkIcon, Loader2, RefreshCw } from 'lucide-react'
import { NodeSelection } from 'prosemirror-state'
import { useEffect, useState } from 'react'
import LinkCardPreview from '~/components/core/link-card-preview'
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

type LinkMetadata = {
  url: string
  title?: string | null
  description?: string | null
  imageUrl?: string | null
  siteName?: string | null
}

export default function LinkDialogButton({
  editor,
  linkUrl,
  setLinkUrl,
  onAddLink,
  onFetchMetadata,
  linkMetadata,
  isFetchingMetadata,
  linkMetadataError,
}: {
  editor: Editor | null
  linkUrl: string
  setLinkUrl: (value: string) => void
  onAddLink: () => void
  onFetchMetadata: () => void
  linkMetadata: LinkMetadata | null
  isFetchingMetadata: boolean
  linkMetadataError: string | null
}) {
  const isEditable = !!editor?.isEditable
  const [selection, setSelection] = useState(editor?.state.selection)

  useEffect(() => {
    if (!editor) return

    const onSelectionUpdate = () => setSelection(editor.state.selection)
    editor.on('selectionUpdate', onSelectionUpdate)
    return () => {
      editor.off('selectionUpdate', onSelectionUpdate)
    }
  }, [editor])

  const hasTextSelection = selection
    ? !selection.empty && !(selection instanceof NodeSelection)
    : false
  const isAnchorLink = linkUrl.trim().startsWith('#')

  return (
    <Dialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={editor?.isActive('link') ? 'bg-muted' : ''}
              disabled={!isEditable}
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>Add Link</TooltipContent>
      </Tooltip>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Link</DialogTitle>
        </DialogHeader>
        <div className="grid min-w-0 gap-4 py-4">
          <div className="grid min-w-0 gap-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              placeholder="https://example.com or #section-id"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              disabled={!isEditable}
              className="min-w-0"
            />
          </div>

          {!hasTextSelection && !isAnchorLink && (
            <div className="flex items-center justify-end">
              <Button
                variant="outline"
                type="button"
                onClick={onFetchMetadata}
                disabled={!isEditable || !linkUrl.trim() || isFetchingMetadata}
              >
                {isFetchingMetadata ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Fetching...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    {linkMetadata ? 'Refetch Metadata' : 'Fetch Metadata'}
                  </>
                )}
              </Button>
            </div>
          )}

          {linkMetadataError ? (
            <p className="text-sm text-destructive">{linkMetadataError}</p>
          ) : null}

          {(linkMetadata || linkUrl.trim()) && !hasTextSelection && !isAnchorLink && (
            <LinkCardPreview
              url={linkMetadata?.url || linkUrl}
              title={linkMetadata?.title}
              description={linkMetadata?.description}
              imageUrl={linkMetadata?.imageUrl}
              siteName={linkMetadata?.siteName}
            />
          )}
        </div>
        <div className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={onAddLink} disabled={!isEditable || !linkUrl.trim()}>
              {hasTextSelection || isAnchorLink ? 'Add Link' : 'Add Link Card'}
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}
