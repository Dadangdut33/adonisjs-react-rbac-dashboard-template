import ActivityLogRepository from '#repositories/activity_log.repository'
import env from '#start/env'

import { inject } from '@adonisjs/core'
import { Exception } from '@adonisjs/core/exceptions'
import { DateTime } from 'luxon'

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

  async clearRange(startDate: string, endDate: string) {
    const startAt = DateTime.fromISO(startDate).startOf('day')
    const endAt = DateTime.fromISO(endDate).endOf('day')

    if (!startAt.isValid || !endAt.isValid) {
      throw new Exception('Invalid date range provided.', { status: 422 })
    }

    if (startAt.toMillis() > endAt.toMillis()) {
      throw new Exception('Start date must be before or equal to end date.', { status: 422 })
    }

    const deleteResult = await this.activityLogRepo.deleteByCreatedAtRange(startAt, endAt)
    const deletedCount = Array.isArray(deleteResult)
      ? deleteResult.length
      : Number(deleteResult) || 0

    return {
      deletedCount,
      startAt,
      endAt,
    }
  }

  async getCreatedAtBounds() {
    const result = await this.activityLogRepo.getCreatedAtBounds()
    const oldestRaw = result?.$extras.oldest_created_at
    const newestRaw = result?.$extras.newest_created_at

    const oldest = oldestRaw ? DateTime.fromJSDate(new Date(oldestRaw)).toISODate() : null
    const newest = newestRaw ? DateTime.fromJSDate(new Date(newestRaw)).toISODate() : null

    return {
      oldest,
      newest,
    }
  }
}
