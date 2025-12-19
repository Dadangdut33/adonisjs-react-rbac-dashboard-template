import User from '#models/user'

import { HttpContext } from '@adonisjs/core/http'

import CustomBasePolicy from './custom_base_policy.js'

// For user profile page
export default class UserPolicy extends CustomBasePolicy {
  private base = 'profile'

  async view(user: User, user_id: string) {
    // must be their own account and they have view permission
    return user_id === String(user.id) && (await this.perm.check(user, `${this.base}.view`))
  }

  async update(user: User, user_id: string, request: HttpContext['request']) {
    // must be their own user account and they have update permission
    return (
      user_id === String(user.id) &&
      (await this.perm.checkInMethod(user, `${this.base}.update`, request, 'PATCH'))
    )
  }
}
