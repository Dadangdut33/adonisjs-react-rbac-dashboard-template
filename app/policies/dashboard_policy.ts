import User from '#models/user'

import CustomBasePolicy from './custom_base_policy.js'

export default class RolePolicy extends CustomBasePolicy {
  private base = 'dashboard'

  async view(user: User) {
    return await this.perm.check(user, `${this.base}.view`)
  }
}
