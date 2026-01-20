import ActivityLog from '#models/activity_log'

import { UserDto } from './user.dto.js'

export class ActivityLogDto {
  readonly id: number
  readonly userId: string | null
  readonly action: string
  readonly target: string
  readonly metadata: Object | null
  readonly created_at: string
  readonly updated_at: string
  readonly user?: UserDto

  constructor(log: ActivityLog) {
    this.id = log.id
    this.userId = log.userId
    this.action = log.action
    this.target = log.target
    this.metadata = log.metadata
    this.created_at = log.createdAt ? log.createdAt.toString() : ''
    this.updated_at = log.updatedAt ? log.updatedAt.toString() : ''
    this.user = log.user ? new UserDto(log.user) : undefined
  }

  static collect(logs: ActivityLog[]): ActivityLogDto[] {
    return logs.map((log) => new ActivityLogDto(log))
  }
}
