import { signRteMediaUrlsForOutput } from '#lib/rte_media_url'
import { buildBlogUrlPath, toSafeSlug } from '#lib/url_slug'
import type Blog from '#models/blog'

import { BlogVersionDto } from './blog_version.dto.js'
import { MediaDto } from './media.dto.js'
import { TagDto } from './tag.dto.js'
import { UserShortDto } from './user_short.dto.js'

export class BlogDto {
  readonly id: string
  readonly slug_id: string
  readonly url_segment: string
  readonly url_path: string
  readonly title: string
  readonly is_active: boolean
  readonly is_pinned: boolean
  readonly thumbnail_id: string | null
  readonly author_id: string | null
  readonly editor_id: string | null
  readonly description: string | null
  readonly content: Record<string, any>
  readonly tags?: TagDto[]
  readonly created_at: string
  readonly updated_at: string
  readonly thumbnail?: MediaDto
  readonly versions?: BlogVersionDto[]
  readonly author?: UserShortDto
  readonly editor?: UserShortDto

  constructor(blog: Blog) {
    const safeTitle = toSafeSlug(blog.title)

    this.id = blog.id
    this.slug_id = blog.slug_id
    this.url_segment = safeTitle ? `${safeTitle}-${blog.slug_id}` : blog.slug_id
    this.url_path = buildBlogUrlPath(blog.title, blog.slug_id)
    this.title = blog.title
    this.is_active = blog.is_active
    this.is_pinned = blog.is_pinned
    this.thumbnail_id = blog.thumbnail_id
    this.author_id = blog.author_id
    this.editor_id = blog.editor_id
    this.description = blog.description
    this.content = signRteMediaUrlsForOutput(blog.content)
    this.tags = blog.tags ? TagDto.collect(blog.tags) : undefined
    this.created_at = blog.created_at ? blog.created_at.toString() : ''
    this.updated_at = blog.updated_at ? blog.updated_at.toString() : ''
    this.thumbnail = blog.thumbnail ? new MediaDto(blog.thumbnail) : undefined
    this.versions = blog.versions ? BlogVersionDto.collect(blog.versions) : undefined
    this.author = blog.author ? new UserShortDto(blog.author) : undefined
    this.editor = blog.editor ? new UserShortDto(blog.editor) : undefined
  }

  static collect(blogs: Blog[]): BlogDto[] {
    return blogs.map((blog) => new BlogDto(blog))
  }
}
