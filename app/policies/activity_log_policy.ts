import type User from '#models/user'

import CustomBasePolicy from './custom_base_policy.js'

export default class ActivityLogPolicy extends CustomBasePolicy {
  private base = 'activity_log'

  async view(user: User) {
    return await this.perm.check(user, `${this.base}.view`)
  }

  async delete(user: User) {
    return await this.perm.check(user, `${this.base}.delete`)
  }
}
