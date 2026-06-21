import type User from '#models/user'

import type { HttpContext } from '@adonisjs/core/http'

import CustomBasePolicy from './custom_base_policy.js'

export default class BlogPolicy extends CustomBasePolicy {
  private base = 'blog'

  async view(user: User) {
    return this.perm.check(user, `${this.base}.view`)
  }

  async viewCreate(user: User) {
    return this.perm.check(user, `${this.base}.create`)
  }

  async viewEdit(user: User) {
    return this.perm.check(user, `${this.base}.update`)
  }

  async create(user: User, request: HttpContext['request']) {
    return this.perm.checkInMethod(user, `${this.base}.create`, request, 'POST')
  }

  async update(user: User, request: HttpContext['request']) {
    return this.perm.checkInMethod(user, `${this.base}.update`, request, 'PATCH')
  }

  async rollback(user: User, request: HttpContext['request']) {
    return this.perm.checkInMethod(user, `${this.base}.update`, request, 'POST')
  }

  async rollbackFields(user: User, request: HttpContext['request']) {
    return this.perm.checkInMethod(user, `${this.base}.update`, request, 'POST')
  }

  async delete(user: User, request: HttpContext['request']) {
    return this.perm.checkInMethod(user, `${this.base}.delete`, request, 'DELETE')
  }
}
