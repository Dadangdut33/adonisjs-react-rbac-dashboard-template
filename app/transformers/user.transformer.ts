import type User from '#models/user'

import { BaseTransformer } from '@adonisjs/core/transformers'

import { ProfileTransformer } from './profile.transformer.js'
import { RoleTransformer } from './role.transformer.js'
import { TokenTransformer } from './token.transformer.js'

export class UserTransformer extends BaseTransformer<User> {
  toObject() {
    return {
      id: this.resource.id,
      username: this.resource.username,
      full_name: this.resource.full_name,
      email: this.resource.email,
      is_email_verified: this.resource.is_email_verified,
      created_at: this.resource.created_at ? this.resource.created_at.toString() : '',
      updated_at: this.resource.updated_at ? this.resource.updated_at.toString() : '',
      roles: RoleTransformer.transform(this.whenLoaded(this.resource.roles)),
      profile: ProfileTransformer.transform(this.whenLoaded(this.resource.profile)),
      tokens: TokenTransformer.transform(this.whenLoaded(this.resource.tokens)),
      passwordResetTokens: TokenTransformer.transform(
        this.whenLoaded(this.resource.passwordResetTokens)
      ),
      verifyEmailTokens: TokenTransformer.transform(
        this.whenLoaded(this.resource.verifyEmailTokens)
      ),
    }
  }
}

export default UserTransformer
