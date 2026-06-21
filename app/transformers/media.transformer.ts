import type Media from '#models/media'

import { BaseTransformer } from '@adonisjs/core/transformers'

import { TagTransformer } from './tag.transformer.js'

export class MediaTransformer extends BaseTransformer<Media> {
  toObject() {
    return {
      id: this.resource.id,
      drive_key: this.resource.drive_key,
      mime_type: this.resource.mime_type,
      name: this.resource.name,
      extension: this.resource.extension,
      size: this.resource.size,
      hash: this.resource.hash,
      tags: TagTransformer.transform(this.whenLoaded(this.resource.tags)),
      created_at: this.resource.created_at ? this.resource.created_at.toString() : '',
      updated_at: this.resource.updated_at ? this.resource.updated_at.toString() : '',
      url: this.resource.url,
    }
  }
}

export default MediaTransformer
