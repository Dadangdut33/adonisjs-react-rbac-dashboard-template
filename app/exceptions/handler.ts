import { errors as bouncerErrors } from '@adonisjs/bouncer'
import { Exception } from '@adonisjs/core/exceptions'
import { ExceptionHandler, HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import type { StatusPageRange, StatusPageRenderer } from '@adonisjs/core/types/http'

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  /**
   * Status pages are used to display a custom HTML pages for certain error
   * codes. You might want to enable them in production only, but feel
   * free to enable them in development as well.
   */
  protected renderStatusPages = app.inProduction

  /**
   * Status pages is a collection of error code range and a callback
   * to return the HTML contents to send as a response.
   */
  protected statusPages: Record<StatusPageRange, StatusPageRenderer> = {
    '401': (error, { inertia }) => inertia.render('errors/not_authorized', { error }),
    '403': (error, { inertia }) => inertia.render('errors/not_allowed', { error }),
    '404': (error, { inertia }) => inertia.render('errors/not_found', { error }),
    '500..599': (error, { inertia }) => inertia.render('errors/server_error', { error }),
  }

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: unknown, ctx: HttpContext) {
    // For handling bouncer authorization errors
    // we force it to show 403 forbidden page instead of a popup of blank white screen with simple text of not authorized
    // Must also be an Inertia response
    if (error instanceof bouncerErrors.E_AUTHORIZATION_FAILURE && ctx.inertia) {
      return super.handle(
        new Exception('You are not allowed to perform this action', {
          status: 403,
        }),
        ctx
      )
    }
    console.log(error)

    // Default error handling
    return super.handle(error, ctx)
  }

  /**
   * The method is used to report error to the logging service or
   * the a third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}
