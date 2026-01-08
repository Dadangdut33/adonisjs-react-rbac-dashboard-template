import Role from '#models/role'
import User from '#models/user'

import { HttpContext } from '@adonisjs/core/http'

import CustomBasePolicy from './custom_base_policy.js'

export default class RolePolicy extends CustomBasePolicy {
  private base = 'role'

  async view(user: User) {
    return await this.perm.check(user, `${this.base}.view`)
  }

  async viewCreate(user: User) {
    return await this.perm.check(user, `${this.base}.create`)
  }

  async viewEdit(user: User) {
    return await this.perm.check(user, `${this.base}.update`)
  }

  async create(user: User, request: HttpContext['request']) {
    return await this.perm.checkInMethod(user, `${this.base}.create`, request, 'POST')
  }

  async update(user: User, role: Role, request: HttpContext['request']) {
    if (role.is_protected) return false // protected
    return await this.perm.checkInMethod(user, `${this.base}.update`, request, 'PATCH')
  }

  // verify. Must not delete the role that is protected
  async delete(user: User, role: Role) {
    if (role.is_protected) return false // protected role

    return await this.perm.check(user, `${this.base}.delete`)
  }
}
