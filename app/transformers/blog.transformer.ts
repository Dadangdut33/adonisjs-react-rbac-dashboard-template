import { signRteMediaUrlsForOutput } from '#lib/rte_media_url'
import { buildBlogUrlPath, toSafeSlug } from '#lib/url_slug'
import type Blog from '#models/blog'

import { BaseTransformer } from '@adonisjs/core/transformers'

import { BlogVersionTransformer } from './blog_version.transformer.js'
import { MediaTransformer } from './media.transformer.js'
import { TagTransformer } from './tag.transformer.js'
import { UserShortTransformer } from './user_short.transformer.js'

export class BlogTransformer extends BaseTransformer<Blog> {
  toObject() {
    const safeTitle = toSafeSlug(this.resource.title)

    return {
      id: this.resource.id,
      slug_id: this.resource.slug_id,
      url_segment: safeTitle ? `${safeTitle}-${this.resource.slug_id}` : this.resource.slug_id,
      url_path: buildBlogUrlPath(this.resource.title, this.resource.slug_id),
      title: this.resource.title,
      is_active: this.resource.is_active,
      is_pinned: this.resource.is_pinned,
      thumbnail_id: this.resource.thumbnail_id,
      author_id: this.resource.author_id,
      editor_id: this.resource.editor_id,
      description: this.resource.description,
      content: signRteMediaUrlsForOutput(this.resource.content),
      tags: TagTransformer.transform(this.whenLoaded(this.resource.tags)),
      created_at: this.resource.created_at ? this.resource.created_at.toString() : '',
      updated_at: this.resource.updated_at ? this.resource.updated_at.toString() : '',
      thumbnail: MediaTransformer.transform(this.whenLoaded(this.resource.thumbnail)),
      versions: BlogVersionTransformer.transform(this.whenLoaded(this.resource.versions)),
      author: UserShortTransformer.transform(this.whenLoaded(this.resource.author)),
      editor: UserShortTransformer.transform(this.whenLoaded(this.resource.editor)),
    }
  }
}

export default BlogTransformer
