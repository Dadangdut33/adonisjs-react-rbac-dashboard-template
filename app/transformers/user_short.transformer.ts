import type User from '#models/user'

import { BaseTransformer } from '@adonisjs/core/transformers'

export class UserShortTransformer extends BaseTransformer<User> {
  toObject() {
    return {
      id: this.resource.id,
      username: this.resource.username,
      full_name: this.resource.full_name,
      avatar_url: this.resource.profile?.avatarUrl || null,
    }
  }
}

export default UserShortTransformer
