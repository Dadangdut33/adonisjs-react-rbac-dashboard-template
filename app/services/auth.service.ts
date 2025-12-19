import PreDefinedRolesId from '#enums/roles'
import PasswordResetNotification from '#mails/password_reset_notification'
import VerifyEmailNotification from '#mails/verify_email_notification'
import User from '#models/user'
import AuthRepository from '#repositories/auth.repository'
import TokenRepository from '#repositories/token.repository'
import UserRepository from '#repositories/user.repository'
import env from '#start/env'
import { TurnstileResponse } from '#types/api'
import { LoginPayload, RegisterPayload } from '#types/inferred'

import { AccessToken } from '@adonisjs/auth/access_tokens'
import { inject } from '@adonisjs/core'
import { Exception } from '@adonisjs/core/exceptions'
import logger from '@adonisjs/core/services/logger'
import db from '@adonisjs/lucid/services/db'
import mail from '@adonisjs/mail/services/main'
import { randomUUID } from 'node:crypto'

@inject()
export default class AuthService {
  constructor(
    protected authRepo: AuthRepository,
    protected tokenRepo: TokenRepository,
    protected userRepo: UserRepository
  ) {}

  /**
   * Register user
   *
   * @param {RegisterPayload} payload
   * @return {*}
   * @memberof AuthService
   */
  async register(payload: RegisterPayload) {
    const existEmail = await this.authRepo.findBy('email', payload.email)
    if (existEmail)
      throw new Exception('User with this email already exists.', {
        status: 400,
      })

    const existUsername = await this.authRepo.findBy('username', payload.username)
    if (existUsername)
      throw new Exception('User with this username already exists.', {
        status: 400,
      })

    // create user roles and profile in transaction
    const trx = await db.transaction()
    let user
    try {
      // We are forced to generate UUID here before creating user so that we can use it in related profile creation
      // Its because using db transaction, the id won't be available after user.save() until trx is committed
      const id = randomUUID()
      user = new User()
      user.useTransaction(trx)
      user.fill({ ...payload, id })
      await user.save()

      // attach user role and create empty profile
      await user.related('roles').attach([PreDefinedRolesId.USER])
      await user.related('profile').create({
        user_id: id,
      })

      await trx.commit()
    } catch (error) {
      trx.rollback()
      throw error
    }

    // login the user after creating
    const accessToken = await User.accessTokens.create(user)
    const emailVerifyToken = await this.tokenRepo.generateTokenForUser(user, 'VERIFY_EMAIL') // make verify email token
    logger.info(`Verify email token for user ${user.id}: ${emailVerifyToken}`, 'EMAIL_VERIFY_TOKEN')
    await mail.send(new VerifyEmailNotification(user, emailVerifyToken)) // email verify notification

    return { accessToken, user }
  }

  /**
   * Login user
   *
   * @param {LoginPayload} { email, password }
   * @return {*}
   * @memberof AuthService
   */
  async login({ email, password }: LoginPayload) {
    const user = await User.verifyCredentials(email, password)
    if (!user) throw new Exception('Invalid email or password.', { status: 401 })

    const accessToken = await User.accessTokens.create(user)

    return { accessToken, user }
  }

  /**
   * Delete access token of a user
   *
   * @param {User} user
   * @param {AccessToken} token
   * @memberof AuthService
   */
  async deleteToken(user: User, token: AccessToken) {
    await User.accessTokens.delete(user, token.identifier)
  }

  /**
   * Request email verification
   *
   * @param {User} user
   * @memberof AuthService
   */
  async requestEmail(user: User) {
    if (user.is_email_verified)
      throw new Exception('Your email is already verified.', {
        status: 400,
      })

    const existingToken = await this.tokenRepo.canRequestToken(user, 'VERIFY_EMAIL')
    if (existingToken)
      throw new Exception('You can only request a verification email every 30 minutes.', {
        status: 429,
      })

    const token = await this.tokenRepo.generateTokenForUser(user, 'VERIFY_EMAIL')
    logger.info(`Verify email token for user ${user.id}: ${token}`, 'EMAIL_VERIFY_TOKEN')
    await mail.send(new VerifyEmailNotification(user, token))
  }

  /**
   * Verify email requesst verification
   *
   * @param {string} token
   * @param {User} authUser
   * @memberof AuthService
   */
  async verifyEmail(token: string, authUser: User) {
    const validToken = await this.tokenRepo.verifyTokenWithUser(token, 'VERIFY_EMAIL', authUser.id)

    if (!validToken)
      throw new Exception('Invalid token or token does not belong to the authenticated user.', {
        status: 401,
      })

    authUser.is_email_verified = true
    await authUser.save()
    await this.tokenRepo.expireUserTokens(authUser, 'VERIFY_EMAIL') // expire all verify email tokens
  }

  /**
   * Request password reset
   *
   * @param {string} email
   * @memberof AuthService
   */
  async requestResetPassword(email: string) {
    const user = await this.authRepo.findBy('email', email)
    if (!user) throw new Exception('User with this email does not exist.', { status: 404 })

    const existingToken = await this.tokenRepo.canRequestToken(user, 'PASSWORD_RESET')
    if (existingToken)
      throw new Exception('You can only request a password reset every 30 minutes.', {
        status: 429,
      })

    const token = await this.tokenRepo.generateTokenForUser(user, 'PASSWORD_RESET')
    await mail.send(new PasswordResetNotification(user, token))
  }

  /**
   * Reset user password
   *
   * @param {string} token
   * @param {string} password
   * @param {string} email
   * @memberof AuthService
   */
  async resetPassword(token: string, password: string, email: string) {
    const user = await User.query().where('email', email).first()
    if (!user) throw new Exception('User with this email does not exist.', { status: 404 })

    const validToken = await this.tokenRepo.getTokenWithUser(token, 'PASSWORD_RESET', user.id)
    if (!validToken)
      throw new Exception('Invalid token or token does not belong to the authenticated user.', {
        status: 401,
      })

    user.password = password

    await user.save()
    await this.tokenRepo.expireUserTokens(user, 'PASSWORD_RESET') // expire all password reset tokens
  }

  async fetchVerifyCFToken(token: string) {
    const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

    const res = await fetch(url, {
      method: 'POST',
      body: `secret=${env.get('TURNSTILE_SECRET')}&response=${token}`,
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
    })

    const data = (await res.json()) as TurnstileResponse
    return data.success
  }

  async verifyCFToken(token: string) {
    const res = await this.fetchVerifyCFToken(token)

    if (!res) throw new Exception('Invalid captcha.', { status: 401 })
  }

  async getUserByPasswordResetToken(token: string) {
    const t = await this.tokenRepo.getToken(token, 'PASSWORD_RESET')

    if (!t) return null

    const user = await this.userRepo.getUserById(t.user_id!)

    return user
  }
}
