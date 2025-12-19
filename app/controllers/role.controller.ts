import { getMethodActName, mapRequestToQueryParams, throwForbidden } from '#lib/utils'
import RoleService from '#services/role.service'
import { createEditRoleValidator } from '#validators/auth/role'

import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class RoleController {
  constructor(protected service: RoleService) {}

  async viewList({ bouncer, request, response, inertia }: HttpContext) {
    if (await bouncer.with('RolePolicy').denies('view')) throwForbidden()
    try {
      const q = mapRequestToQueryParams(request)
      const data = await this.service.index(q)

      return inertia.render('dashboard/role', data)
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
      const payload = await request.validateUsing(createEditRoleValidator)

      if (request.method() === 'POST') {
        if (await bouncer.with('RolePolicy').denies('create', request)) throwForbidden()

        await this.service.create(payload)
      } else if (request.method() === 'PATCH') {
        const role = await this.service.findOrFail(payload.id!)
        if (await bouncer.with('RolePolicy').denies('update', request)) throwForbidden()

        await this.service.updateWithModel(role, payload)
      } else {
        throwForbidden()
      }

      return response.status(200).json({
        status: 'success',
        message: `Successfully ${getMethodActName(request)} role.`,
      })
    } catch (error) {
      return response.status(error.status || 500).json({
        status: 'error',
        message: error.messages?.[0]?.message || error.message || 'Something went wrong',
      })
    }
  }

  async destroy({ bouncer, response, params }: HttpContext) {
    try {
      const id = params.id
      const role = await this.service.findOrFail(id)
      if (await bouncer.with('RolePolicy').denies('delete', role)) throwForbidden()

      await this.service.deleteRole(id)

      return response.status(200).json({
        status: 'success',
        message: 'Successfully deleted role.',
      })
    } catch (error) {
      return response.status(error.status || 500).json({
        status: 'error',
        message: error.messages?.[0]?.message || error.message || 'Something went wrong',
      })
    }
  }
}
