import { UserDto } from '#dto/user.dto'
import {
  getMethodActName,
  mapRequestToQueryParams,
  throwForbidden,
  throwNotFound,
} from '#lib/utils'
import MediaService from '#services/media.service'
import ProfileService from '#services/profile.service'
import RoleService from '#services/role.service'
import UserService from '#services/user.service'
import { PaginationMeta } from '#types/app'
import { createEditUserValidator } from '#validators/user'

import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { route } from '@izzyjs/route/client'

@inject()
export default class UserController {
  constructor(
    protected userSvc: UserService,
    protected roleSvc: RoleService,
    protected mediaSvc: MediaService,
    protected profileSvc: ProfileService
  ) {}

  async viewCreate({ bouncer, inertia, auth }: HttpContext) {
    await bouncer.with('UserPolicy').authorize('viewCreate')

    // we must load current user role first
    await auth.user?.load('roles')
    let roles = await this.roleSvc.listWithCheck(auth.user?.roles || [])

    return inertia.render('dashboard/user/createEdit', { data: null, roles: roles })
  }

  async viewEdit({ bouncer, inertia, params, auth }: HttpContext) {
    await bouncer.with('UserPolicy').authorize('viewEdit')

    const id = params.id
    if (!id) return throwNotFound()

    const data = await this.userSvc.findOrFail(id)
    await data.load('profile')
    await data.load('roles')

    // we must load current user role first
    await auth.user?.load('roles')
    let roles = await this.roleSvc.listWithCheck(auth.user?.roles || [])

    return inertia.render('dashboard/user/createEdit', {
      data: new UserDto(data),
      roles: roles,
    })
  }

  async viewList({ request, response, bouncer, inertia }: HttpContext) {
    await bouncer.with('UserPolicy').authorize('view')

    try {
      const q = mapRequestToQueryParams(request)
      const dataQ = await this.userSvc.index(q)

      return inertia.render('dashboard/user/list', {
        data: UserDto.collect(dataQ.all()),
        meta: dataQ.getMeta() as PaginationMeta,
      })
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

      if (request.method() === 'POST') {
        await bouncer.with('UserPolicy').authorize('create', payload, request)

        await this.userSvc.create(payload)
      } else if (request.method() === 'PATCH') {
        await bouncer.with('UserPolicy').authorize('update', payload, request)

        await this.userSvc.update(payload)
      } else {
        throwForbidden()
      }

      return response.status(200).json({
        status: 'success',
        message: `Successfully ${getMethodActName(request)} user.`,
        redirect_to: route(`user.index`).path,
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
      await this.userSvc.deleteUser(id)

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
