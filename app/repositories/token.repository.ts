import Token from '#models/token'
import User from '#models/user'

import stringHelpers from '@adonisjs/core/helpers/string'
import { DateTime } from 'luxon'

import BaseRepository from './_base_repository.js'

type TokenType = 'PASSWORD_RESET' | 'VERIFY_EMAIL'

/**
 * Repository class for managing user tokens such as email verification and password reset tokens.
 *
 * Extends the `BaseRepository` to provide token-specific operations, including:
 * - Generating tokens with expiration times based on token type.
 * - Checking if a user can request a new token within a time limit.
 * - Expiring or deleting tokens related to a user.
 * - Retrieving a token and its associated user, ensuring the token is valid and not expired.
 * - Verifying the validity of a token by type and expiration.
 *
 * @remarks
 * Token expiration times are determined by the token type:
 * - `VERIFY_EMAIL`: 30 minutes
 * - `PASSWORD_RESET`: 15 minutes
 *
 * @example
 * ```typescript
 * const repo = new TokenRepository();
 * const canRequest = await repo.canRequestToken(user, 'VERIFY_EMAIL');
 * const token = await repo.generateToken(user, 'PASSWORD_RESET');
 * const isValid = await repo.verifyToken(token, 'PASSWORD_RESET');
 * ```
 */
export default class TokenRepository extends BaseRepository<typeof Token> {
  constructor() {
    super(Token)
  }

  private getTokenTimeLimit(type: TokenType) {
    if (type === 'VERIFY_EMAIL') {
      return { minutes: 30 }
    } else if (type === 'PASSWORD_RESET') {
      return { minutes: 15 }
    }

    throw new Error(`Unknown token type: ${type}`)
  }

  async canRequestToken(user: User, type: TokenType) {
    return await this.model
      .query()
      .where('user_id', user.id)
      .where('type', type)
      .where('created_at', '>', DateTime.now().minus(this.getTokenTimeLimit(type)).toSQL())
      .first()
  }

  async generateTokenForUser(user: User, type: TokenType) {
    const token = stringHelpers.generateRandom(64)
    const expirationTime = DateTime.now().plus(this.getTokenTimeLimit(type))

    const record = new Token()
    record.fill({
      type,
      expires_at: expirationTime,
      token,
      user_id: user.id,
    })
    await record.save()

    return record.token
  }

  async expireUserTokens(user: User, type: TokenType) {
    await this.model.query().where('user_id', user.id).where('type', type).update({
      expires_at: DateTime.now(),
    })
  }

  async deleteUserTokens(user: User, type: TokenType) {
    await this.model.query().where('user_id', user.id).where('type', type).delete()
  }

  async getToken(token: string, type: TokenType) {
    const record = await this.model
      .query()
      .where('token', token)
      .where('type', type)
      .where('expires_at', '>', DateTime.now().toSQL())
      .orderBy('created_at', 'desc')
      .first()

    return record
  }

  async getTokenWithUser(token: string, type: TokenType, user_id: string) {
    const record = await this.model
      .query()
      .where('user_id', user_id)
      .where('token', token)
      .where('type', type)
      .where('expires_at', '>', DateTime.now().toSQL())
      .orderBy('created_at', 'desc')
      .first()

    return record
  }

  async verifyToken(token: string, type: TokenType) {
    const record = await this.model
      .query()
      .where('expires_at', '>', DateTime.now().toSQL())
      .where('token', token)
      .where('type', type)
      .first()

    return !!record
  }

  async verifyTokenWithUser(token: string, type: TokenType, user_id: string) {
    const record = await this.model
      .query()
      .where('expires_at', '>', DateTime.now().toSQL())
      .where('token', token)
      .where('type', type)
      .where('user_id', user_id)
      .first()

    return !!record
  }
}
