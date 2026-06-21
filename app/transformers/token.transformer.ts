import type Token from '#models/token'

import { BaseTransformer } from '@adonisjs/core/transformers'

export class TokenTransformer extends BaseTransformer<Token> {
  toObject() {
    return {
      id: this.resource.id,
      type: this.resource.type,
      token: this.resource.token,
      expires_at: this.resource.expires_at ? this.resource.expires_at.toString() : null,
      created_at: this.resource.created_at ? this.resource.created_at.toString() : '',
      updated_at: this.resource.updated_at ? this.resource.updated_at.toString() : '',
    }
  }
}

export default TokenTransformer
