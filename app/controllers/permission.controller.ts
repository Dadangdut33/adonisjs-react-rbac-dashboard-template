import { PermissionDto } from '#dto/permission.dto'
import {
  getMethodActName,
  getRequestFingerprint,
  mapRequestToQueryParams,
  returnError,
  throwForbidden,
  throwNotFound,
} from '#lib/utils'
import ActivityLogService from '#services/activity_log.service'
import PermissionService from '#services/permission.service'
import PermissionCheckService from '#services/permission_check.service'
import { PaginationMeta } from '#types/app'
import { createEditPermissionValidator } from '#validators/auth/permission'

import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { route } from '@izzyjs/route/client'

@inject()
export default class PermissionController {
  constructor(
    protected permSvc: PermissionService,
    protected permChecker: PermissionCheckService,
    protected activityLogSvc: ActivityLogService
  ) {}

  async viewCreate({ bouncer, inertia }: HttpContext) {
    await bouncer.with('PermissionPolicy').authorize('viewCreate')
    return inertia.render('dashboard/permission/createEdit', { data: null })
  }

  async viewEdit({ bouncer, inertia, params }: HttpContext) {
    await bouncer.with('PermissionPolicy').authorize('viewEdit')

    const id = params.id
    if (!id) return throwNotFound()

    const data = await this.permSvc.findOrFail(id)
    if (data.is_protected) return throwForbidden()

    return inertia.render('dashboard/permission/createEdit', {
      data: new PermissionDto(data),
    })
  }

  async viewList({ request, bouncer, inertia }: HttpContext) {
    await bouncer.with('PermissionPolicy').authorize('view')

    const q = mapRequestToQueryParams(request)
    const dataQ = await this.permSvc.index(q)

    return inertia.render('dashboard/permission/list', {
      data: PermissionDto.collect(dataQ.all()),
      meta: dataQ.getMeta() as PaginationMeta,
    })
  }

  // if POST request -> create
  // if PATCH request -> update
  async storeOrUpdate({ request, response, bouncer, auth }: HttpContext) {
    try {
      const payload = await request.validateUsing(createEditPermissionValidator)

      if (request.method() === 'POST') {
        await bouncer.with('PermissionPolicy').authorize('create', request)

        const created = await this.permSvc.create(payload)
        await this.activityLogSvc.log(
          auth.user!.id,
          'create_permission',
          `Created permission:\n\`\`\`\n${payload.name} [${(created as unknown as { id: number }).id}]\n\`\`\``,
          getRequestFingerprint(request)
        )
      } else if (request.method() === 'PATCH') {
        const permission = await this.permSvc.findOrFail(payload.id!)
        await bouncer.with('PermissionPolicy').authorize('update', permission, request)

        await this.permSvc.update(permission, payload)
        await this.activityLogSvc.log(
          auth.user!.id,
          'update_permission',
          `Updated permission:\n\`\`\`\n${permission.name} [${permission.id}]\n\`\`\``,
          getRequestFingerprint(request)
        )
      } else {
        throwForbidden()
      }

      return response.status(200).json({
        status: 'success',
        message: `Successfully ${getMethodActName(request)} permission.`,
        redirect_to: route('permission.index').path,
      })
    } catch (error) {
      return returnError(response, error, `PERMISSION_${request.method()}`, { logErrors: true })
    }
  }

  async destroy({ response, request, params, bouncer, auth }: HttpContext) {
    try {
      const id = params.id
      const permission = await this.permSvc.findOrFail(id)
      await bouncer.with('PermissionPolicy').authorize('delete', permission)

      await this.permSvc.deletePermission(id)
      await this.activityLogSvc.log(
        auth.user!.id,
        'delete_permission',
        `Deleted permission:\n\`\`\`\n${permission.name} [${permission.id}]\n\`\`\``,
        getRequestFingerprint(request)
      )

      return response.status(200).json({
        status: 'success',
        message: 'Successfully deleted permission.',
      })
    } catch (error) {
      return returnError(response, error, 'PERMISSION_DELETE', { logErrors: true })
    }
  }

  async bulkDestroy({ response, request, bouncer, auth }: HttpContext) {
    try {
      const { ids } = request.only(['ids'])
      if (!ids || !Array.isArray(ids)) return response.badRequest('Invalid ids provided')

      const permissions = await this.permSvc.findByIds(ids)
      await bouncer.with('PermissionPolicy').authorize('deleteBulk', permissions)

      const namesIds = permissions.map((p) => `- ${p.name} [${p.id}]`).join('\n')
      await this.permSvc.deletePermissions(ids)
      await this.activityLogSvc.log(
        auth.user!.id,
        'bulk_delete_permission',
        `Deleted permissions:\n\`\`\`\n${namesIds}\n\`\`\``,
        getRequestFingerprint(request)
      )

      return response.status(200).json({
        status: 'success',
        message: 'Successfully deleted permissions.',
      })
    } catch (error) {
      return returnError(response, error, 'PERMISSION_BULK_DELETE', { logErrors: true })
    }
  }
}
