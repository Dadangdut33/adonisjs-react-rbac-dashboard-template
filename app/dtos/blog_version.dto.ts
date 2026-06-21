import { signRteMediaUrlsForOutput } from '#lib/rte_media_url'
import type BlogVersion from '#models/blog_version'

import { MediaDto } from './media.dto.js'
import { TagDto } from './tag.dto.js'
import { UserShortDto } from './user_short.dto.js'

export class BlogVersionDto {
  readonly id: string
  readonly blog_id: string
  readonly version: number
  readonly change_type: 'create' | 'update'
  readonly slug_id: string
  readonly title: string
  readonly is_active: boolean
  readonly is_pinned: boolean
  readonly thumbnail_id: string | null
  readonly author_id: string | null
  readonly editor_id: string | null
  readonly description: string | null
  readonly content: Record<string, any>
  readonly tags?: TagDto[]
  readonly changed_fields: string[] | null
  readonly created_at: string
  readonly updated_at: string
  readonly thumbnail?: MediaDto
  readonly author?: UserShortDto
  readonly editor?: UserShortDto

  constructor(version: BlogVersion) {
    this.id = version.id
    this.blog_id = version.blog_id
    this.version = version.version
    this.change_type = version.change_type
    this.slug_id = version.slug_id
    this.title = version.title
    this.is_active = version.is_active
    this.is_pinned = version.is_pinned
    this.thumbnail_id = version.thumbnail_id
    this.author_id = version.author_id
    this.editor_id = version.editor_id
    this.description = version.description
    this.content = signRteMediaUrlsForOutput(version.content)
    this.tags = version.tags ? TagDto.collect(version.tags) : undefined
    this.changed_fields = version.changed_fields
    this.created_at = version.created_at ? version.created_at.toString() : ''
    this.updated_at = version.updated_at ? version.updated_at.toString() : ''
    this.thumbnail = version.thumbnail ? new MediaDto(version.thumbnail) : undefined
    this.author = version.author ? new UserShortDto(version.author) : undefined
    this.editor = version.editor ? new UserShortDto(version.editor) : undefined
  }

  static collect(versions: BlogVersion[]): BlogVersionDto[] {
    return versions.map((version) => new BlogVersionDto(version))
  }
}
