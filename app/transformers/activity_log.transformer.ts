import type ActivityLog from '#models/activity_log'

import { BaseTransformer } from '@adonisjs/core/transformers'

import { UserTransformer } from './user.transformer.js'

export class ActivityLogTransformer extends BaseTransformer<ActivityLog> {
  toObject() {
    return {
      id: this.resource.id,
      userId: this.resource.userId,
      action: this.resource.action,
      target: this.resource.target,
      metadata: this.resource.metadata,
      created_at: this.resource.createdAt ? this.resource.createdAt.toString() : '',
      updated_at: this.resource.updatedAt ? this.resource.updatedAt.toString() : '',
      user: UserTransformer.transform(this.whenLoaded(this.resource.user)),
    }
  }
}

export default ActivityLogTransformer
