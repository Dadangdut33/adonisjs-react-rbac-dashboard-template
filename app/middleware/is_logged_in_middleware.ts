import type { Authenticators } from '@adonisjs/auth/types'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { route } from '@izzyjs/route/client'

/**
 * When this user is logged-in, they should be redirected to dashboard
 */
export default class IsLoggedInMiddleware {
  /**
   * The URL to redirect to when user is logged-in
   */
  redirect_to = route('dashboard.view').path

  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: { guards?: (keyof Authenticators)[] } = {}
  ) {
    for (let guard of options.guards || [ctx.auth.defaultGuard]) {
      if (await ctx.auth.use(guard).check()) {
        return ctx.response.redirect(this.redirect_to, true)
      }
    }

    return next()
  }
}
