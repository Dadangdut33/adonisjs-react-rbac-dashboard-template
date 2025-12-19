import { getMethodActName, mapRequestToQueryParams, throwForbidden } from '#lib/utils'
import PermissionCheckService from '#services/permission_check.service'
import ProfileService from '#services/profile.service'
import { updateProfileValidator } from '#validators/profile'

import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class ProfileController {
  constructor(
    protected service: ProfileService,
    protected permChecker: PermissionCheckService
  ) {}

  async view({ request, response, bouncer, auth, inertia }: HttpContext) {
    const userId = auth.user?.id
    if (await bouncer.with('ProfilePolicy').denies('view', userId!)) return throwForbidden()

    try {
      const q = mapRequestToQueryParams(request)
      const data = await this.service.index(q)

      return inertia.render('dashboard/profile', data)
    } catch (error) {
      return response.status(error.status || 500).json({
        status: 'error',
        message: error.messages?.[0]?.message || error.message || 'Something went wrong',
      })
    }
  }

  async update({ bouncer, request, response, auth }: HttpContext) {
    try {
      const userId = auth.user?.id
      const data = await request.validateUsing(updateProfileValidator)

      if (await bouncer.with('ProfilePolicy').denies('update', userId!, request))
        return throwForbidden()

      await this.service.update(userId!, data)

      return response.status(200).json({
        status: 'success',
        message: `Successfully ${getMethodActName(request)} user.`,
      })
    } catch (error) {
      return response.status(error.status || 500).json({
        status: 'error',
        message: error.messages?.[0]?.message || error.message || 'Something went wrong',
      })
    }
  }

  async getAvatar({ bouncer, auth, response }: HttpContext) {
    try {
      const userId = auth.user?.id
      if (await bouncer.with('ProfilePolicy').denies('view', userId!)) return throwForbidden()

      const avatar = await this.service.getAvatar(userId!)

      return response.status(200).json({
        status: 'success',
        data: avatar,
      })
    } catch (error) {
      return response.status(error.status || 500).json({
        status: 'error',
        message: error.messages?.[0]?.message || error.message || 'Something went wrong',
      })
    }
  }
}
