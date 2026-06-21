import { Editor } from '@tiptap/react'
import { Loader2, RefreshCw, Youtube } from 'lucide-react'
import ImageWithLoader from '~/components/core/image'
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

type YoutubeMetadata = {
  url: string
  videoId: string
  title?: string | null
  thumbnailUrl?: string | null
}

export default function YoutubeDialogButton({
  editor,
  youtubeUrl,
  setYoutubeUrl,
  onAddYoutube,
  onFetchYoutubeMetadata,
  youtubeMetadata,
  isFetchingYoutubeMetadata,
  youtubeMetadataError,
}: {
  editor: Editor | null
  youtubeUrl: string
  setYoutubeUrl: (value: string) => void
  onAddYoutube: () => void
  onFetchYoutubeMetadata: () => void
  youtubeMetadata: YoutubeMetadata | null
  isFetchingYoutubeMetadata: boolean
  youtubeMetadataError: string | null
}) {
  const isEditable = !!editor?.isEditable

  return (
    <Dialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" disabled={!isEditable}>
              <Youtube className="h-4 w-4" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>Add YouTube Embed</TooltipContent>
      </Tooltip>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add YouTube Embed</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="youtube-url">YouTube URL</Label>
            <Input
              id="youtube-url"
              placeholder="https://youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              disabled={!isEditable}
            />
          </div>

          <div className="flex justify-end">
            <Button
              variant="outline"
              type="button"
              onClick={onFetchYoutubeMetadata}
              disabled={!isEditable || !youtubeUrl.trim() || isFetchingYoutubeMetadata}
            >
              {isFetchingYoutubeMetadata ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Fetching...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  {youtubeMetadata ? 'Refetch Metadata' : 'Fetch Metadata'}
                </>
              )}
            </Button>
          </div>

          {youtubeMetadataError ? (
            <p className="text-sm text-destructive">{youtubeMetadataError}</p>
          ) : null}

          {(youtubeMetadata?.thumbnailUrl || youtubeMetadata?.title) && (
            <div className="rounded-base overflow-hidden border-2 border-border">
              {youtubeMetadata?.thumbnailUrl ? (
                <ImageWithLoader
                  src={youtubeMetadata.thumbnailUrl}
                  alt={youtubeMetadata.title || 'YouTube thumbnail'}
                  className="aspect-video w-full object-cover"
                />
              ) : null}
              <div className="bg-secondary-background p-3">
                <p className="text-sm font-heading">{youtubeMetadata?.title || 'YouTube video'}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={onAddYoutube} disabled={!isEditable || !youtubeUrl.trim()}>
              Add Embed
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}
