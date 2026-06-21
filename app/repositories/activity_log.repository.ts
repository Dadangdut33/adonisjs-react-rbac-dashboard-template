import ActivityLog from '#models/activity_log'

import type { DateTime } from 'luxon'

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

  async deleteByCreatedAtRange(startAt: DateTime, endAt: DateTime) {
    return await this.model
      .query()
      .where('created_at', '>=', startAt.toSQL()!)
      .where('created_at', '<=', endAt.toSQL()!)
      .delete()
  }

  async getCreatedAtBounds() {
    return await this.model
      .query()
      .min('created_at as oldest_created_at')
      .max('created_at as newest_created_at')
      .first()
  }
}
