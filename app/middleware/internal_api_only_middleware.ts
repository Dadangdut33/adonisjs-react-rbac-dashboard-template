import { throwForbidden } from '#lib/utils'
import env from '#start/env'

import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

const SAME_SITE_HEADERS = new Set(['same-origin', 'same-site'])

export default class InternalApiOnlyMiddleware {
  private getAllowedOriginHost() {
    try {
      return new URL(env.get('APP_URL')).host
    } catch {
      return null
    }
  }

  private isSameHost(url: string, allowedHost: string) {
    try {
      return new URL(url).host === allowedHost
    } catch {
      return false
    }
  }

  async handle({ request }: HttpContext, next: NextFn) {
    const allowedHost = this.getAllowedOriginHost()
    if (!allowedHost) {
      return throwForbidden('Internal API origin is not configured')
    }

    const origin = request.header('origin')
    const referer = request.header('referer')
    const fetchSite = (request.header('sec-fetch-site') || '').toLowerCase()

    if (origin && this.isSameHost(origin, allowedHost)) {
      return next()
    }

    if (referer && this.isSameHost(referer, allowedHost)) {
      return next()
    }

    if (SAME_SITE_HEADERS.has(fetchSite)) {
      return next()
    }

    return throwForbidden('This API endpoint can only be called from this website')
  }
}
