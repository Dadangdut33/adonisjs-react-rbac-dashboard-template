import type Profile from '#models/profile'

import { BaseTransformer } from '@adonisjs/core/transformers'

import { MediaTransformer } from './media.transformer.js'

export class ProfileTransformer extends BaseTransformer<Profile> {
  toObject() {
    return {
      id: this.resource.id,
      avatar_id: this.resource.avatar_id,
      bio: this.resource.bio,
      user_id: this.resource.user_id,
      avatar: MediaTransformer.transform(this.whenLoaded(this.resource.avatar)),
      avatarUrl: this.resource.avatarUrl,
      created_at: this.resource.created_at ? this.resource.created_at.toString() : '',
      updated_at: this.resource.updated_at ? this.resource.updated_at.toString() : '',
    }
  }
}

export default ProfileTransformer
