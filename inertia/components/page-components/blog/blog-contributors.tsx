import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { cn } from '~/lib/utils'

type Person = {
  id: string
  username: string
  full_name: string
  avatar_url?: string | null
}

type BlogContributorsProps = {
  author?: Person | null
  editor?: Person | null
  className?: string
  compact?: boolean
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2)
  if (!parts.length) return '?'
  return parts.map((part) => part[0]?.toUpperCase() || '').join('')
}

function renderPerson(person: Person) {
  const displayName = person.full_name || person.username
  return (
    <div className="inline-flex items-center gap-1.5">
      <Avatar className={cn('size-6')}>
        <AvatarImage src={person.avatar_url || undefined} alt={displayName} />
        <AvatarFallback className={cn('text-[11px]')}>{getInitials(displayName)}</AvatarFallback>
      </Avatar>
      <span className={cn('text-foreground/70', 'text-xs')}>
        <span className="font-heading text-foreground">{displayName}</span>
      </span>
    </div>
  )
}

export default function BlogContributors({ author, editor, className }: BlogContributorsProps) {
  if (!author && !editor) return null

  const samePerson = !!author && !!editor && author.id === editor.id

  return (
    <div className={cn('flex flex-wrap items-center gap-x-3 gap-y-1.5', className)}>
      {author && (
        <div className="inline-flex items-center gap-1">
          {samePerson ? renderPerson(author) : renderPerson(author)}
        </div>
      )}

      {!samePerson && editor && (
        <div className="inline-flex items-center gap-1">{renderPerson(editor)}</div>
      )}
    </div>
  )
}
