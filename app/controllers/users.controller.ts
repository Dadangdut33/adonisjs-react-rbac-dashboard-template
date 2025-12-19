import { getMethodActName, mapRequestToQueryParams, throwForbidden } from '#lib/utils'
import UserService from '#services/user.service'
import { createEditUserValidator } from '#validators/users'

import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class UsersController {
  constructor(protected service: UserService) {}

  async viewList({ request, response, bouncer, inertia }: HttpContext) {
    if (await bouncer.with('UserPolicy').denies('view')) return throwForbidden()

    try {
      const q = mapRequestToQueryParams(request)
      const data = await this.service.index(q)

      return inertia.render('dashboard/users', data)
    } catch (error) {
      return response.status(error.status || 500).json({
        status: 'error',
        message: error.messages?.[0]?.message || error.message || 'Something went wrong',
      })
    }
  }

  // if POST request -> create
  // if PATCH request -> update
  async storeOrUpdate({ bouncer, request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(createEditUserValidator)
      if (await bouncer.with('UserPolicy').denies('create', payload, request))
        return throwForbidden()
      if (await bouncer.with('UserPolicy').denies('update', payload, request))
        return throwForbidden()

      await this.service.createUpdate(payload)

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

  async destroy({ response, params, bouncer }: HttpContext) {
    try {
      if (await bouncer.with('UserPolicy').denies('delete')) return throwForbidden()

      const id = params.id
      await this.service.deleteUser(id)

      return response.status(200).json({
        status: 'success',
        message: 'Successfully deleted user.',
      })
    } catch (error) {
      return response.status(error.status || 500).json({
        status: 'error',
        message: error.messages?.[0]?.message || error.message || 'Something went wrong',
      })
    }
  }
}
