import ActivityLog from '#models/activity_log'

import BaseRepository from './_base_repository.js'

export default class ActivityLogRepository extends BaseRepository<typeof ActivityLog> {
  constructor() {
    super(ActivityLog)
  }

  async createLog(userId: string, action: string, target: string, metadata?: any) {
    return await this.model.create({
      userId,
      action,
      target,
      metadata,
    })
  }
}
