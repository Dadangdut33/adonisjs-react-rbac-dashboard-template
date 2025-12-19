import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Middleware to ensure that the authenticated user's email address is verified.
 *
 * This middleware checks the `isEmailVerified` property of the authenticated user.
 * If the email is not verified, it returns a 403 Forbidden response with an appropriate message.
 * Otherwise, it allows the request to proceed to the next middleware or controller.
 *
 * @class VerifyEmailMiddleware
 * @method handle
 * @param {HttpContext} ctx - The HTTP context containing the request, response, and authentication objects.
 * @param {NextFn} next - The next middleware function in the stack.
 * @returns {Promise<any>} Returns the result of the next middleware or a 403 response if the email is not verified.
 */
export default class VerifyEmailMiddleware {
  async handle({ response, auth, session }: HttpContext, next: NextFn) {
    const isEmailVerified = auth.user?.is_email_verified

    if (!isEmailVerified) {
      session.flash('error', 'Please verify your email address to proceed.')
      return response.redirect().toRoute('auth.verifyEmail')
    }

    const output = await next()
    return output
  }
}
