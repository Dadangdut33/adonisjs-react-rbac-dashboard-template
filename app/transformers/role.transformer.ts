import type Role from '#models/role'

import { BaseTransformer } from '@adonisjs/core/transformers'

import { PermissionTransformer } from './permission.transformer.js'
import { TagTransformer } from './tag.transformer.js'

export class RoleTransformer extends BaseTransformer<Role> {
  toObject() {
    return {
      id: this.resource.id,
      name: this.resource.name,
      is_protected: this.resource.is_protected,
      can_access_all_media_tags: this.resource.can_access_all_media_tags,
      created_at: this.resource.created_at ? this.resource.created_at.toString() : '',
      updated_at: this.resource.updated_at ? this.resource.updated_at.toString() : '',
      permissions: this.resource.permissions
        ? PermissionTransformer.transform(this.resource.permissions)
        : [],
      media_tags: this.resource.media_tags
        ? TagTransformer.transform(this.resource.media_tags)
        : [],
    }
  }
}

export default RoleTransformer
