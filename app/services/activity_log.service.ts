import ActivityLogRepository from '#repositories/activity_log.repository'
import env from '#start/env'

import { inject } from '@adonisjs/core'

@inject()
export default class ActivityLogService {
  constructor(protected activityLogRepo: ActivityLogRepository) {}

  async index(q: any) {
    const query = this.activityLogRepo.query({
      ...q,
      preload: ['user'],
    })

    return this.activityLogRepo.paginate(query, q)
  }

  async log(userId: string, action: string, target: string, metadata?: any) {
    if (!env.get('ENABLE_ACTIVITY_LOG')) {
      return
    }

    await this.activityLogRepo.createLog(userId, action, target, metadata)
  }
}
