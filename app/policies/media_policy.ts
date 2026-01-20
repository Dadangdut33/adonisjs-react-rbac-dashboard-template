import User from '#models/user'

import { HttpContext } from '@adonisjs/core/http'

import CustomBasePolicy from './custom_base_policy.js'

export default class MediaPolicy extends CustomBasePolicy {
  private base = 'media'

  async view(user: User) {
    return await this.perm.check(user, `${this.base}.view`)
  }

  async create(user: User, request: HttpContext['request']) {
    return await this.perm.checkInMethod(user, `${this.base}.create`, request, 'POST')
  }

  async delete(user: User) {
    return await this.perm.check(user, `${this.base}.delete`)
  }
}
