import { generateRandomPassword, returnError } from '#lib/utils'
import LinkMetadataService from '#services/link_metadata.service'

import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class UtilsController {
  constructor(protected linkMetadataSvc: LinkMetadataService) {}

  async getLinkMetadata({ request, response }: HttpContext) {
    try {
      const rawUrl = String(request.input('url', '')).trim()
      if (!rawUrl) {
        return response.badRequest({
          status: 'error',
          message: 'URL is required',
        })
      }

      const data = await this.linkMetadataSvc.fetch(rawUrl)
      return response.ok({
        status: 'success',
        data,
      })
    } catch (error) {
      return returnError(response, error, 'UTILS_LINK_METADATA', { logErrors: false })
    }
  }

  async generateRandomPassword({ response }: HttpContext) {
    try {
      const password = generateRandomPassword()
      return response.status(200).json({
        status: 'success',
        data: password,
      })
    } catch (error) {
      return returnError(response, error, `USER_GENERATE_PASSWORD`, { logErrors: true })
    }
  }
}
