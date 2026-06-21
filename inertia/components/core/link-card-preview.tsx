import { ExternalLink, Globe } from 'lucide-react'
import { Badge } from '~/components/ui/badge'
import { Card, CardContent } from '~/components/ui/card'
import { cn, limitString } from '~/lib/utils'

import ImageWithLoader from './image'

type LinkCardPreviewProps = {
  url: string
  title?: string | null
  description?: string | null
  imageUrl?: string | null
  siteName?: string | null
  className?: string
}

function parseUrl(url: string) {
  try {
    const parsed = new URL(url)
    return {
      hostname: parsed.hostname.replace(/^www\./, ''),
      displayUrl: `${parsed.hostname.replace(/^www\./, '')}${parsed.pathname === '/' ? '' : parsed.pathname}`,
    }
  } catch {
    return {
      hostname: 'External Link',
      displayUrl: url,
    }
  }
}

export default function LinkCardPreview({
  url,
  title,
  description,
  imageUrl,
  siteName,
  className,
}: LinkCardPreviewProps) {
  const { hostname, displayUrl } = parseUrl(url)
  const resolvedTitle = title?.trim() || hostname
  const resolvedDescription = description?.trim() || 'Click to open this link in a new tab.'

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full"
      aria-label={`Open link: ${resolvedTitle}`}
    >
      <Card
        className={cn(
          'group w-full gap-0 overflow-hidden transition-transform hover:-translate-y-0.5',
          className
        )}
      >
        {imageUrl ? (
          <div className="h-40 w-full overflow-hidden border-b-2 border-border bg-muted">
            <ImageWithLoader
              src={imageUrl}
              alt={resolvedTitle}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="flex h-24 items-center justify-center border-b-2 border-border bg-secondary/40">
            <Globe className="h-7 w-7 opacity-70" />
          </div>
        )}

        <CardContent className="space-y-2 p-4">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="neutral" className="max-w-[80%] truncate">
              {siteName?.trim() || hostname}
            </Badge>
            <ExternalLink className="h-4 w-4 shrink-0 opacity-70 transition-opacity group-hover:opacity-100" />
          </div>

          <h4 className="line-clamp-2 break-words text-sm font-heading">{resolvedTitle}</h4>
          <p className="line-clamp-2 text-xs text-muted-foreground">{resolvedDescription}</p>
          <p className="break-all text-xs text-muted-foreground/80">
            {limitString(displayUrl, 70)}
          </p>
        </CardContent>
      </Card>
    </a>
  )
}
