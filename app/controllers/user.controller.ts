import { UserDto } from '#dto/user.dto'
import {
  generateRandomPassword,
  getMethodActName,
  getRequestFingerprint,
  mapRequestToQueryParams,
  returnError,
  throwForbidden,
  throwNotFound,
} from '#lib/utils'
import ActivityLogService from '#services/activity_log.service'
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
    protected profileSvc: ProfileService,
    protected activityLogSvc: ActivityLogService
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

  async viewList({ request, bouncer, inertia }: HttpContext) {
    await bouncer.with('UserPolicy').authorize('view')

    const q = mapRequestToQueryParams(request)
    const dataQ = await this.userSvc.index(q)

    return inertia.render('dashboard/user/list', {
      data: UserDto.collect(dataQ.all()),
      meta: dataQ.getMeta() as PaginationMeta,
    })
  }

  // if POST request -> create
  // if PATCH request -> update
  async storeOrUpdate({ bouncer, request, response, auth }: HttpContext) {
    try {
      const payload = await request.validateUsing(createEditUserValidator)

      if (request.method() === 'POST') {
        await bouncer.with('UserPolicy').authorize('create', payload, request)

        const created = await this.userSvc.create(payload)
        await this.activityLogSvc.log(
          auth.user!.id,
          'create_user',
          `Created user:\n\`\`\`\n${created.email} [${created.id}]\n\`\`\``,
          getRequestFingerprint(request)
        )
      } else if (request.method() === 'PATCH') {
        await bouncer.with('UserPolicy').authorize('update', payload, request)

        const updated = await this.userSvc.update(payload)
        await this.activityLogSvc.log(
          auth.user!.id,
          'update_user',
          `Updated user:\n\`\`\`\n${updated.email} [${updated.id}]\n\`\`\``,
          getRequestFingerprint(request)
        )
      } else {
        throwForbidden()
      }

      return response.status(200).json({
        status: 'success',
        message: `Successfully ${getMethodActName(request)} user.`,
        redirect_to: route(`user.index`).path,
      })
    } catch (error) {
      return returnError(response, error, `USER_${getMethodActName(request)}`, { logErrors: true })
    }
  }

  async destroy({ response, params, bouncer, auth, request }: HttpContext) {
    try {
      if (await bouncer.with('UserPolicy').denies('delete')) return throwForbidden()

      const id = params.id

      const user = await this.userSvc.findOrFail(id)
      await user.load('profile')
      const profile = user.profile

      await this.userSvc.deleteUser(id)
      await this.activityLogSvc.log(
        auth.user!.id,
        'delete_user',
        `Deleted user:\n\`\`\`\n${user.email} [${user.id}]\n\`\`\``,
        getRequestFingerprint(request)
      )

      if (profile.avatar_id) {
        await this.mediaSvc.delete(profile.avatar_id)
      }

      return response.status(200).json({
        status: 'success',
        message: 'Successfully deleted user.',
      })
    } catch (error) {
      return returnError(response, error, `USER_DELETE`, { logErrors: true })
    }
  }

  async bulkDestroy({ response, request, bouncer, auth }: HttpContext) {
    try {
      if (await bouncer.with('UserPolicy').denies('delete')) return throwForbidden()

      const { ids } = request.only(['ids'])
      if (!ids || !Array.isArray(ids)) return response.badRequest('Invalid ids provided')

      const users = await this.userSvc.findByIds(ids)
      const emailsIds = users.map((u) => `- ${u.email} [${u.id}]`).join('\n')

      await this.userSvc.deleteUsers(ids)
      await this.activityLogSvc.log(
        auth.user!.id,
        'bulk_delete_user',
        `Deleted users:\n\`\`\`\n${emailsIds}\n\`\`\``,
        getRequestFingerprint(request)
      )

      for (const user of users) {
        if (user.profile.avatar_id) {
          await this.mediaSvc.delete(user.profile.avatar_id)
        }
      }

      return response.status(200).json({
        status: 'success',
        message: 'Successfully deleted users.',
      })
    } catch (error) {
      return returnError(response, error, `USER_BULK_DELETE`, { logErrors: true })
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
