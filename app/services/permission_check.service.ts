import User from '#models/user'

import { Exception } from '@adonisjs/core/exceptions'
import { HttpContext } from '@adonisjs/core/http'

/**
 * Service for handling user permission checks.
 */
export default class PermissionCheckService {
  /**
   * Checks if the given user has a specific permission.
   *
   * @param user - The user entity to check permissions for.
   * @param permissionName - The name of the permission to check.
   * @returns A promise that resolves to `true` if the user has the permission, otherwise `false`.
   */
  async check(user: User, permissionName: string): Promise<boolean> {
    // Load roles with their permissions
    await user.load('roles', (query) => {
      query.preload('permissions')
    })

    // Debug logging - check if roles and permissions are loaded
    // console.log('User roles loaded:', user.roles.length)
    // console.log(
    //   'Roles:',
    //   user.roles.map((role) => ({
    //     name: role.name,
    //     permissionsCount: role.permissions.length,
    //     permissions: role.permissions.map((p) => p.name),
    //   }))
    // )

    // Check if user has the permission through any of their roles
    return user.roles.some((role) => {
      return role.permissions.some((permission) => permission.name === permissionName)
    })
  }

  /**
   * Ensures the user has the specified permission, throwing an exception if not.
   *
   * @param user - The user entity to check permissions for.
   * @param permissionName - The name of the permission to check.
   * @throws Exception if the user does not have the required permission.
   */
  async checkThrowErr(user: User, permissionName: string) {
    const hasPermission = await this.check(user, permissionName)

    if (!hasPermission) {
      throw new Exception('You are not authorized to perform this action', {
        status: 403,
      })
    }
  }

  /**
   * Checks if the user has the specified permission for a specific HTTP method.
   * If the request method does not match, no check is performed.
   *
   * @param user - The user entity to check permissions for.
   * @param permissionName - The name of the permission to check.
   * @param request - The HTTP request context.
   * @param matchMethod - The HTTP method to match (e.g., 'POST', 'GET').
   * @throws Exception if the user does not have the required permission and the method matches.
   */
  async checkInMethodThrowErr(
    user: User,
    permissionName: string,
    request: HttpContext['request'],
    matchMethod: string
  ) {
    if (request.method() !== matchMethod) return
    await this.checkThrowErr(user, permissionName)
  }

  /**
   * Checks if the user has the specified permission for a specific HTTP method.
   * If the request method does not match, no check is performed.
   *
   * @param user - The user entity to check permissions for.
   * @param permissionName - The name of the permission to check.
   * @param request - The HTTP request context.
   * @param matchMethod - The HTTP method to match (e.g., 'POST', 'GET').
   * @returns A promise that resolves to `true` if the user has the permission, otherwise `false`.
   */
  async checkInMethod(
    user: User,
    permissionName: string,
    request: HttpContext['request'],
    matchMethod: string
  ) {
    if (request.method() !== matchMethod) return false
    return await this.check(user, permissionName)
  }
}
