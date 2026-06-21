import Media from '#models/media'
import type User from '#models/user'

import type { HttpContext } from '@adonisjs/core/http'

import CustomBasePolicy from './custom_base_policy.js'

export default class MediaPolicy extends CustomBasePolicy {
  private base = 'media'

  private async getAllowedTagIdsForUser(user: User) {
    await user.load('roles', (query) => {
      query.preload('media_tags')
    })

    if (user.roles.some((role) => role.can_access_all_media_tags)) {
      return null
    }

    const tagIds = new Set<string>()
    for (const role of user.roles) {
      for (const tag of role.media_tags || []) {
        tagIds.add(tag.id)
      }
    }

    return [...tagIds]
  }

  async view(user: User) {
    return await this.perm.check(user, `${this.base}.view`)
  }

  async create(user: User, request: HttpContext['request']) {
    return await this.perm.checkInMethod(user, `${this.base}.create`, request, 'POST')
  }

  async delete(user: User) {
    return await this.perm.check(user, `${this.base}.delete`)
  }

  async accessByTag(user: User, mediaId: string) {
    const allowedTagIds = await this.getAllowedTagIdsForUser(user)
    if (allowedTagIds === null) return true
    if (allowedTagIds.length === 0) return false

    const media = await Media.query()
      .where('id', mediaId)
      .whereHas('tags', (query) => {
        query.whereIn('tags.id', allowedTagIds)
      })
      .first()

    return !!media
  }

  async accessBulkByTag(user: User, mediaIds: string[]) {
    if (!mediaIds || mediaIds.length === 0) return false

    const allowedTagIds = await this.getAllowedTagIdsForUser(user)
    if (allowedTagIds === null) return true
    if (allowedTagIds.length === 0) return false

    const accessibleCount = await Media.query()
      .whereIn('id', mediaIds)
      .whereHas('tags', (query) => {
        query.whereIn('tags.id', allowedTagIds)
      })
      .countDistinct('id as total')
      .first()

    const totalAccessible = Number(accessibleCount?.$extras.total ?? 0)
    return totalAccessible === mediaIds.length
  }
}
