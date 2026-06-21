import { signRteMediaUrlsForOutput } from '#lib/rte_media_url'
import type BlogVersion from '#models/blog_version'

import { BaseTransformer } from '@adonisjs/core/transformers'

import { MediaTransformer } from './media.transformer.js'
import { TagTransformer } from './tag.transformer.js'
import { UserShortTransformer } from './user_short.transformer.js'

export class BlogVersionTransformer extends BaseTransformer<BlogVersion> {
  toObject() {
    return {
      id: this.resource.id,
      blog_id: this.resource.blog_id,
      version: this.resource.version,
      change_type: this.resource.change_type,
      slug_id: this.resource.slug_id,
      title: this.resource.title,
      is_active: this.resource.is_active,
      is_pinned: this.resource.is_pinned,
      thumbnail_id: this.resource.thumbnail_id,
      author_id: this.resource.author_id,
      editor_id: this.resource.editor_id,
      description: this.resource.description,
      content: signRteMediaUrlsForOutput(this.resource.content),
      tags: TagTransformer.transform(this.whenLoaded(this.resource.tags)),
      changed_fields: this.resource.changed_fields,
      created_at: this.resource.created_at ? this.resource.created_at.toString() : '',
      updated_at: this.resource.updated_at ? this.resource.updated_at.toString() : '',
      thumbnail: MediaTransformer.transform(this.whenLoaded(this.resource.thumbnail)),
      author: UserShortTransformer.transform(this.whenLoaded(this.resource.author)),
      editor: UserShortTransformer.transform(this.whenLoaded(this.resource.editor)),
    }
  }
}

export default BlogVersionTransformer
