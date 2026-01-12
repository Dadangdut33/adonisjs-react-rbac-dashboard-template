import {
  getMethodActName,
  mapRequestToQueryParams,
  returnError,
  throwForbidden,
  throwNotFound,
} from '#lib/utils'
import PermissionService from '#services/permission.service'
import RoleService from '#services/role.service'
import { PaginationMeta } from '#types/app'
import { createEditRoleValidator } from '#validators/auth/role'

import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { route } from '@izzyjs/route/client'

import { RoleDto } from '../dtos/role.dto.js'

@inject()
export default class RoleController {
  constructor(
    protected roleSvc: RoleService,
    protected permSvc: PermissionService
  ) {}

  async viewCreate({ bouncer, inertia }: HttpContext) {
    await bouncer.with('RolePolicy').authorize('viewCreate')
    const permissions = await this.permSvc.listGroupedByBaseName()
    return inertia.render('dashboard/role/createEdit', { data: null, permissions: permissions })
  }

  async viewEdit({ bouncer, inertia, params }: HttpContext) {
    await bouncer.with('RolePolicy').authorize('viewEdit')

    const id = params.id
    if (!id) return throwNotFound()

    const data = await this.roleSvc.findOrFail(id)
    await data.load('permissions') // load permissions relation

    const permissions = await this.permSvc.listGroupedByBaseName()

    return inertia.render('dashboard/role/createEdit', {
      data: new RoleDto(data),
      permissions: permissions,
    })
  }

  async viewList({ bouncer, request, inertia }: HttpContext) {
    await bouncer.with('RolePolicy').authorize('view')

    const q = mapRequestToQueryParams(request)
    const dataQ = await this.roleSvc.index(q)

    return inertia.render('dashboard/role/list', {
      data: RoleDto.collect(dataQ.all()),
      meta: dataQ.getMeta() as PaginationMeta,
    })
  }

  // if POST request -> create
  // if PATCH request -> update
  async storeOrUpdate({ request, response, bouncer }: HttpContext) {
    try {
      const payload = await request.validateUsing(createEditRoleValidator)

      if (request.method() === 'POST') {
        await bouncer.with('RolePolicy').authorize('create', request)

        await this.roleSvc.create(payload)
      } else if (request.method() === 'PATCH') {
        await bouncer.with('RolePolicy').authorize('update', request)
        const role = await this.roleSvc.findOrFail(payload.id!)

        await this.roleSvc.update(role, payload)
      } else {
        throwForbidden()
      }

      return response.status(200).json({
        status: 'success',
        message: `Successfully ${getMethodActName(request)} role.`,
        redirect_to: route('role.index').path,
      })
    } catch (error) {
      return returnError(response, error, `ROLE_${request.method()}`, { logErrors: true })
    }
  }

  async destroy({ bouncer, response, params }: HttpContext) {
    try {
      const id = params.id
      const role = await this.roleSvc.findOrFail(id)
      await bouncer.with('RolePolicy').authorize('delete', role)

      await this.roleSvc.deleteRole(id)

      return response.status(200).json({
        status: 'success',
        message: 'Successfully deleted role.',
      })
    } catch (error) {
      return returnError(response, error, `ROLE_DELETE`, { logErrors: true })
    }
  }
}
