import PermissionCheckService from '#services/permission_check.service'

import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

@inject()
export default class PermissionMiddleware {
  constructor(protected permChecker: PermissionCheckService) {}

  async handle({ auth, response }: HttpContext, next: NextFn, options: { permission: string }) {
    const user = auth.user!

    const hasPermission = await this.permChecker.check(user, options.permission)

    if (!hasPermission) {
      return response.unauthorized({ message: 'You are not authorized to perform this action' })
    }

    return next()
  }
}
