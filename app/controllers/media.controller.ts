import { returnError } from '#lib/utils'
import MediaService from '#services/media.service'
import PermissionCheckService from '#services/permission_check.service'

import cache from '@adonisjs/cache/services/main'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'

@inject()
export default class ProfileController {
  constructor(
    protected mediaSvc: MediaService,
    protected permChecker: PermissionCheckService
  ) {}

  async redirectMediaAPI({ request, response, params }: HttpContext) {
    // must be a valid signed URL
    // ex to make: router.builder().params({ id: xxx }).makeSigned('api.v1.media.redirect')
    if (!request.hasValidSignature()) {
      return response.badRequest('Invalid or expired URL')
    }

    try {
      const { id } = params
      if (!id) return response.abort(404)

      const url = await cache.getOrSet({
        key: 'media-' + id,
        ttl: '1h',
        factory: async () => {
          return await this.mediaSvc.getMediaURLById(id)
        },
        onFactoryError(error) {
          logger.error(error, 'MEDIA_PROXY_FACTORY_ERROR ' + id)
        },
      })

      if (!url) return response.abort(404)

      return response.redirect(url)
    } catch (error) {
      return returnError(response, error, `MEDIA_PROXY`, { logErrors: true })
    }
  }
}
