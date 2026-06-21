import type Permission from '#models/permission'

import { BaseTransformer } from '@adonisjs/core/transformers'

export class PermissionTransformer extends BaseTransformer<Permission> {
  toObject() {
    return {
      id: this.resource.id,
      name: this.resource.name,
      is_protected: this.resource.is_protected,
      created_at: this.resource.created_at ? this.resource.created_at.toString() : '',
      updated_at: this.resource.updated_at ? this.resource.updated_at.toString() : '',
    }
  }
}

export default PermissionTransformer
