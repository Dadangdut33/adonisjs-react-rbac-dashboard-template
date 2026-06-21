import { errors } from '@adonisjs/auth'
import { Authenticators } from '@adonisjs/auth/types'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { urlFor } from '@adonisjs/core/services/url_builder'

/**
 * Auth middleware is used authenticate HTTP requests and deny
 * access to unauthenticated users.
 */
export default class AuthMiddleware {
  /**
   * The URL to redirect to, when authentication fails
   */
  redirect_to = urlFor('auth.login')

  async handle(
    { auth, session }: HttpContext,
    next: NextFn,
    options: {
      guards?: (keyof Authenticators)[]
    } = {}
  ) {
    try {
      await auth.authenticateUsing(options.guards, { loginRoute: this.redirect_to })
    } catch (error) {
      if (error instanceof errors.E_UNAUTHORIZED_ACCESS) {
        session.flash('error', 'Unauthorized access. Please log in.')
      }
      throw error
    }
    return next()
  }
}
