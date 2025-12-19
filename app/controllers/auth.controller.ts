import { mapReqErrors, reqErrorsToString, throwNotFound } from '#lib/utils'
import AuthService from '#services/auth.service'
import env from '#start/env'
import {
  askEmailVerifyValidator,
  askResetPasswordValidator,
  authValidatorMessage,
  loginValidator,
  registerValidator,
  resetPasswordValidator,
} from '#validators/auth/auth'

import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import { route } from '@izzyjs/route/client'

@inject()
export default class AuthController {
  protected bypassCaptcha = env.get('BYPASS_CF_TURNSTILE')
  protected siteKey = env.get('TURNSTILE_SITE')
  protected enableRegistration = env.get('ENABLE_REGISTRATION')
  protected enableForgotPassword = env.get('ENABLE_FORGOT_PASSWORD')
  protected hideRegistration = env.get('HIDE_REGISTRATION')
  protected hideForgotPassword = env.get('HIDE_FORGOT_PASSWORD')
  protected baseProp = {
    site_key: this.siteKey,
    bypass_captcha: this.bypassCaptcha,
    hide_registration: this.hideRegistration,
    hide_forgot_password: this.hideForgotPassword,
  }

  constructor(protected service: AuthService) {}

  async viewLogin({ inertia }: HttpContext) {
    return inertia.render('auth/login', { ...this.baseProp })
  }

  async viewRegister({ inertia, response }: HttpContext) {
    if (!this.enableRegistration) return response.redirect().toRoute('auth.login')
    return inertia.render('auth/register', { ...this.baseProp })
  }

  async viewRequestResetPassword({ inertia, response }: HttpContext) {
    if (!this.enableForgotPassword) return response.redirect().toRoute('auth.login')
    return inertia.render('auth/requestResetPassword', { ...this.baseProp })
  }

  async viewResetPassword({ inertia, params, response }: HttpContext) {
    if (!this.enableForgotPassword) return response.redirect().toRoute('auth.login')
    const token: string = params.token || ''

    // get the email associated with the token
    const user = await this.service.getUserByPasswordResetToken(token)
    if (!user) return throwNotFound()

    return inertia.render('auth/resetPassword', { token, ...this.baseProp, email: user.email })
  }

  async viewVerifyEmail({ inertia, response, auth }: HttpContext) {
    // if already verified, redirect to dashboard
    if (auth.user?.is_email_verified) return response.redirect().toRoute('dashboard')
    return inertia.render('auth/verifyEmail', { ...this.baseProp })
  }

  async login({ request, response, auth }: HttpContext) {
    try {
      const payload = await request.validateUsing(loginValidator, {
        messagesProvider: authValidatorMessage,
      })

      if (!this.bypassCaptcha) await this.service.verifyCFToken(payload.cf_token!)
      const { user } = await this.service.login(payload)

      // *important: set the current login user to web
      await auth.use('web').login(user)

      // if user is not verified, redirect to verify email page
      if (!user.is_email_verified)
        return response.status(200).json({
          status: 'success',
          message: 'Login successful, but need to verify email',
          data: { user: user.toJSON() },
          redirect_to: route('auth.verifyEmail').path,
        })

      return response.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: { user: user.toJSON() },
        redirect_to: route('dashboard').path,
      })
    } catch (error) {
      if (error.type !== 'ValidationError') logger.error(error, 'AUTH_LOGIN_USER')
      return response.status(error.status || 500).json({
        status: 'error',
        message: reqErrorsToString(error) || error.message || 'Something went wrong',
        form_errorss: mapReqErrors(error),
      })
    }
  }

  async register({ request, response, session }: HttpContext) {
    if (!this.enableRegistration) return response.redirect().toRoute('auth.login')

    try {
      const payload = await request.validateUsing(registerValidator, {
        messagesProvider: authValidatorMessage,
      })
      if (!this.bypassCaptcha) await this.service.verifyCFToken(payload.cf_token!)
      const { accessToken, user } = await this.service.register(payload)

      session.flash(
        'success',
        'User registered successfully, please login and verify your email to continue'
      )

      return response.status(201).json({
        status: 'success',
        message: 'User registered successfully, please login and verify your email to continue',
        data: { accessToken, user: user.toJSON() },
        redirect_to: route('auth.login').path,
      })
    } catch (error) {
      if (error.type !== 'ValidationError') logger.error(error, 'AUTH_REGISTER_USER')
      return response.status(error.status || 500).json({
        status: 'error',
        message: reqErrorsToString(error) || error.message || 'Something went wrong',
        form_errors: mapReqErrors(error),
      })
    }
  }

  /**
   * Request a new email verification for the authenticated user.
   * This is used for when the user have logged in but their email is not verified.
   *
   * @param {HttpContext} { request,response, auth }
   * @return {*}
   * @memberof AuthController
   */
  async requestVerifyEmail({ request, response, auth }: HttpContext) {
    try {
      const payload = await request.validateUsing(askEmailVerifyValidator, {
        messagesProvider: authValidatorMessage,
      })
      if (!this.bypassCaptcha) await this.service.verifyCFToken(payload.cf_token!)

      // first check if user is already verified
      const user = auth.getUserOrFail()
      if (user.is_email_verified)
        return response.status(200).json({
          status: 'success',
          message: 'User is already verified',
          redirect_to: route('dashboard').path,
        })

      await this.service.requestEmail(user)

      return response.status(200).json({
        status: 'success',
        message: 'Request for new email verification sent successfully',
      })
    } catch (error) {
      if (error.type !== 'ValidationError') logger.error(error, 'AUTH_REQUEST_VERIFY_EMAIL')
      return response.status(error.status || 500).json({
        status: 'error',
        message: reqErrorsToString(error) || error.message || 'Something went wrong',
        form_errors: mapReqErrors(error),
      })
    }
  }

  /**
   * Verify email verification token
   *
   * @param {HttpContext} { response, params, auth, session }
   * @return {*}
   * @memberof AuthController
   */
  async verifyEmail({ response, params, auth, session }: HttpContext) {
    try {
      const token = params.token
      const user = auth.getUserOrFail()

      await this.service.verifyEmail(token, user)

      // redirect to dashboard immediately, because this is a one time request that is only a link
      session.flash('success', 'Email verified successfully')
      return response.redirect().toRoute('dashboard')
    } catch (error) {
      logger.error(error, 'AUTH_VERIFY_EMAIL')
      return response.status(error.status || 500).json({
        status: 'error',
        message: reqErrorsToString(error) || error.message || 'Something went wrong',
        form_errors: mapReqErrors(error),
      })
    }
  }

  /**
   * Request a password reset
   *
   * @param {HttpContext} { request, response }
   * @return {*}
   * @memberof AuthController
   */
  async requestResetPassword({ request, response }: HttpContext) {
    if (!this.enableForgotPassword) return response.redirect().toRoute('auth.login')

    try {
      const payload = await request.validateUsing(askResetPasswordValidator, {
        messagesProvider: authValidatorMessage,
      })
      if (!this.bypassCaptcha) await this.service.verifyCFToken(payload.cf_token!)
      await this.service.requestResetPassword(payload.email)

      return response.status(200).json({
        status: 'success',
        message: 'Password reset email sent successfully',
      })
    } catch (error) {
      if (error.type !== 'ValidationError') logger.error(error, 'AUTH_REQUEST_RESET_PASSWORD')
      return response.status(error.status || 500).json({
        status: 'error',
        message: reqErrorsToString(error) || error.message || 'Something went wrong',
        form_errors: mapReqErrors(error),
      })
    }
  }

  async resetPassword({ request, response }: HttpContext) {
    if (!this.enableForgotPassword) return response.redirect().toRoute('auth.login')

    try {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { email, password, token, cf_token } =
        await request.validateUsing(resetPasswordValidator)
      if (!this.bypassCaptcha) await this.service.verifyCFToken(cf_token!)

      await this.service.resetPassword(token, password, email)

      return response.status(200).json({
        status: 'success',
        message: 'Password reset successfully, please login with your new password',
        redirect_to: route('auth.login').path,
      })
    } catch (error) {
      if (error.type !== 'ValidationError') logger.error(error, 'AUTH_RESET_PASSWORD')
      return response.status(error.status || 500).json({
        status: 'error',
        message: reqErrorsToString(error) || error.message || 'Something went wrong',
        form_errors: mapReqErrors(error),
      })
    }
  }

  /**
   * Logout a user by invalidating their access token and loging out the auth
   *
   * @param {HttpContext} { auth, response, session }
   * @return {*}
   * @memberof AuthController
   */
  async logout({ auth, response, session }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      if (auth.authenticatedViaGuard === 'web') {
        await auth.use('web').logout()

        session.flash('success', 'Logged out successfully')
        return response.status(200).json({
          status: 'success',
          message: 'Logged out successfully',
          redirect_to: route('auth.login').path,
        })
      } else {
        const token = user.currentAccessToken
        await this.service.deleteToken(user, token!)

        return response.status(200).json({
          status: 'success',
          message: 'Logged out successfully',
        })
      }
    } catch (error) {
      logger.error(error, 'AUTH_LOGOUT')
      return response.status(error.status || 500).json({
        status: 'error',
        message: reqErrorsToString(error) || error.message || 'Something went wrong',
        form_errors: mapReqErrors(error),
      })
    }
  }

  async getAuthUser({ auth, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()

      return response.status(200).json({
        status: 'success',
        message: 'User fetched successfully',
        data: user,
      })
    } catch (error) {
      return response.status(error.status || 500).json({
        status: 'error',
        message: reqErrorsToString(error) || error.message || 'Something went wrong',
        form_errors: mapReqErrors(error),
      })
    }
  }
}
