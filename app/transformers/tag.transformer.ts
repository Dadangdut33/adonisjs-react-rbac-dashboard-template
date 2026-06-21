import type Tag from '#models/tag'

import { BaseTransformer } from '@adonisjs/core/transformers'

export class TagTransformer extends BaseTransformer<Tag> {
  toObject() {
    return {
      id: this.resource.id,
      name: this.resource.name,
      type: this.resource.type,
      created_at: this.resource.created_at ? this.resource.created_at.toString() : '',
      updated_at: this.resource.updated_at ? this.resource.updated_at.toString() : '',
    }
  }
}

export default TagTransformer
