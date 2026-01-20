import { MediaDto } from '#dto/media.dto'
import { mapRequestToQueryParams, returnError } from '#lib/utils'
import MediaService from '#services/media.service'
import PermissionCheckService from '#services/permission_check.service'
import { PaginationMeta } from '#types/app'

import cache from '@adonisjs/cache/services/main'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'

@inject()
export default class MediaController {
  constructor(
    protected mediaSvc: MediaService,
    protected permChecker: PermissionCheckService
  ) {}

  async viewList({ request, response, bouncer, inertia }: HttpContext) {
    await bouncer.with('MediaPolicy').authorize('view')

    try {
      const q = mapRequestToQueryParams(request)
      const dataQ = await this.mediaSvc.index(q)

      return inertia.render('dashboard/media/list', {
        data: MediaDto.collect(dataQ.all()),
        meta: dataQ.getMeta() as PaginationMeta,
      })
    } catch (error) {
      return response.status(error.status || 500).json({
        status: 'error',
        message: error.messages?.[0]?.message || error.message || 'Something went wrong',
      })
    }
  }

  async destroy({ response, params, bouncer }: HttpContext) {
    try {
      await bouncer.with('MediaPolicy').authorize('delete')

      const id = params.id
      await this.mediaSvc.delete(id)

      return response.status(200).json({
        status: 'success',
        message: 'Successfully deleted media.',
      })
    } catch (error) {
      return response.status(error.status || 500).json({
        status: 'error',
        message: error.messages?.[0]?.message || error.message || 'Something went wrong',
      })
    }
  }

  async bulkDestroy({ response, request, bouncer }: HttpContext) {
    try {
      await bouncer.with('MediaPolicy').authorize('delete')

      const { ids } = request.only(['ids'])
      if (!ids || !Array.isArray(ids)) return response.badRequest('Invalid ids provided')

      await this.mediaSvc.deleteBulk(ids)

      return response.status(200).json({
        status: 'success',
        message: 'Successfully deleted selected media.',
      })
    } catch (error) {
      return response.status(error.status || 500).json({
        status: 'error',
        message: error.messages?.[0]?.message || error.message || 'Something went wrong',
      })
    }
  }

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
