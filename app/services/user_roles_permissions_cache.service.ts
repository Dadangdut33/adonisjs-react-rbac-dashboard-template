import Permission from '#models/permission'
import Role from '#models/role'

import cache from '@adonisjs/cache/services/main'
import { inject } from '@adonisjs/core'

@inject()
export default class UserRolesPermissionsCacheService {
  private makeKey(userId: string) {
    return `user_roles_permissions_${userId}`
  }

  async invalidateForUserIds(userIds: Array<string | null | undefined>) {
    const uniqueIds = Array.from(
      new Set(
        userIds
          .filter((userId): userId is string => typeof userId === 'string' && userId.length > 0)
          .map((userId) => userId)
      )
    )

    await Promise.all(
      uniqueIds.map((userId) =>
        cache.delete({
          key: this.makeKey(userId),
        })
      )
    )
  }

  async invalidateForRoleIds(roleIds: number[]) {
    if (roleIds.length === 0) return

    const roles = await Role.query()
      .whereIn('id', roleIds)
      .preload('users', (query) => {
        query.select('id')
      })

    const userIds = roles.flatMap((role) => role.users.map((user) => user.id))
    await this.invalidateForUserIds(userIds)
  }

  async invalidateForPermissionIds(permissionIds: number[]) {
    if (permissionIds.length === 0) return

    const permissions = await Permission.query()
      .whereIn('id', permissionIds)
      .preload('roles', (roleQuery) => {
        roleQuery.preload('users', (userQuery) => {
          userQuery.select('id')
        })
      })

    const userIds = permissions.flatMap((permission) =>
      permission.roles.flatMap((role) => role.users.map((user) => user.id))
    )

    await this.invalidateForUserIds(userIds)
  }
}
