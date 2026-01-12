import PreDefinedRolesId from '#enums/roles'
import User from '#models/user'
import { UserPayload } from '#types/inferred'

import { HttpContext } from '@adonisjs/core/http'

import CustomBasePolicy from './custom_base_policy.js'

/**
 * For manage user page
 */
export default class UserPolicy extends CustomBasePolicy {
  private base = 'user'
  private restrictedRoles = [PreDefinedRolesId.ADMIN, PreDefinedRolesId.SUPER_ADMIN]

  async view(user: User) {
    return await this.perm.check(user, `${this.base}.view`)
  }

  async viewCreate(user: User) {
    return await this.perm.check(user, `${this.base}.create`)
  }

  async viewEdit(user: User) {
    return await this.perm.check(user, `${this.base}.update`)
  }

  async create(user: User, payload: UserPayload, request: HttpContext['request']) {
    // first check if they have permission for the route or not
    if (!(await this.perm.checkInMethod(user, `${this.base}.create`, request, 'POST'))) return false

    // then we must check they must be admin level or super admin to do this
    if (!user.roles.some((r) => this.restrictedRoles.includes(r.id))) return false

    // additionally check if the user is creating an admin or super admin. Must be a super admin
    if (payload.roleIds.some((role) => this.restrictedRoles.includes(role)) && !user.isSuperAdmin)
      return false

    return true
  }

  async update(user: User, payload: UserPayload, request: HttpContext['request']) {
    // first check if they have permission for the route or not
    if (!(await this.perm.checkInMethod(user, `${this.base}.update`, request, 'PATCH')))
      return false

    // then we must check they must be admin level or super admin to do this
    if (!user.roles.some((r) => this.restrictedRoles.includes(r.id))) return false

    // additionally check if the user is creating an admin or super admin. Must be a super admin
    if (payload.roleIds.some((role) => this.restrictedRoles.includes(role)) && !user.isSuperAdmin)
      return false

    return true
  }

  async delete(user: User) {
    return await this.perm.check(user, `${this.base}.delete`)
  }
}
