import { getMethodActName, mapRequestToQueryParams, throwForbidden } from '#lib/utils'
import PermissionService from '#services/permission.service'
import PermissionCheckService from '#services/permission_check.service'
import { createEditPermissionValidator } from '#validators/auth/permission'

import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class PermissionController {
  constructor(
    protected service: PermissionService,
    protected permChecker: PermissionCheckService
  ) {}

  async viewList({ request, response, bouncer, inertia }: HttpContext) {
    if (await bouncer.with('PermissionPolicy').denies('view')) return throwForbidden()

    try {
      const q = mapRequestToQueryParams(request)
      const data = await this.service.index(q)

      return inertia.render('dashboard/permission/list', data)
    } catch (error) {
      return response.status(error.status || 500).json({
        status: 'error',
        message: error.messages?.[0]?.message || error.message || 'Something went wrong',
      })
    }
  }

  // if POST request -> create
  // if PATCH request -> update
  async storeOrUpdate({ request, response, bouncer }: HttpContext) {
    try {
      const payload = await request.validateUsing(createEditPermissionValidator)

      if (request.method() === 'POST') {
        if (await bouncer.with('PermissionPolicy').denies('create', request)) throwForbidden()

        await this.service.create(payload)
      } else if (request.method() === 'PATCH') {
        const permission = await this.service.findOrFail(payload.id!)
        if (await bouncer.with('PermissionPolicy').denies('update', permission, request))
          throwForbidden()

        await this.service.create(payload)
      } else {
        throwForbidden()
      }

      return response.status(200).json({
        status: 'success',
        message: `Successfully ${getMethodActName(request)} permission.`,
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
      const id = params.id
      const permission = await this.service.findOrFail(id)
      if (await bouncer.with('PermissionPolicy').denies('delete', permission)) throwForbidden()

      await this.service.deletePermission(id)

      return response.status(200).json({
        status: 'success',
        message: 'Successfully deleted permission.',
      })
    } catch (error) {
      return response.status(error.status || 500).json({
        status: 'error',
        message: error.messages?.[0]?.message || error.message || 'Something went wrong',
      })
    }
  }
}
