import Permission from '#models/permission'
import User from '#models/user'

import { HttpContext } from '@adonisjs/core/http'

import CustomBasePolicy from './custom_base_policy.js'

export default class PermissionPolicy extends CustomBasePolicy {
  private base = 'permission'

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

  async update(user: User, permission: Permission, request: HttpContext['request']) {
    if (permission.is_protected) return false // protected permission
    return await this.perm.checkInMethod(user, `${this.base}.update`, request, 'PATCH')
  }

  async delete(user: User, permission: Permission) {
    if (permission.is_protected) return false // protected permission

    return await this.perm.check(user, `${this.base}.delete`)
  }

  async deleteBulk(user: User, permissions: Permission[]) {
    const protectedPermissions = permissions.filter((permission) => permission.is_protected)
    if (protectedPermissions.length > 0) return false // protected permission

    return await this.perm.check(user, `${this.base}.delete`)
  }
}
