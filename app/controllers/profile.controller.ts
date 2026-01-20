import { getMethodActName, getRequestFingerprint, returnError } from '#lib/utils'
import Media from '#models/media'
import ActivityLogService from '#services/activity_log.service'
import MediaService from '#services/media.service'
import PermissionCheckService from '#services/permission_check.service'
import ProfileService from '#services/profile.service'
import { updateProfileValidator } from '#validators/profile'

import cache from '@adonisjs/cache/services/main'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'

@inject()
export default class ProfileController {
  constructor(
    protected profileSvc: ProfileService,
    protected mediaSvc: MediaService,
    protected permChecker: PermissionCheckService,
    protected activityLogSvc: ActivityLogService
  ) {}

  async view({ bouncer, auth, inertia }: HttpContext) {
    const userId = auth.user?.id
    await bouncer.with('ProfilePolicy').authorize('view', userId!)

    auth.user!.load('roles') // load roles
    const data = await this.profileSvc.findByUid(userId!)
    if (!data) {
      logger.warn("Profile somehow doesn't exist???", 'PROFILE_VIEW_DOES_NOT_EXIST ' + userId!)
      // create a new empty profile
      await this.profileSvc.create({ user_id: userId! })
      logger.info(
        "Profile created because it somehow doesn't exist",
        'PROFILE_VIEW_CREATED ' + userId!
      )
    }

    return inertia.render('dashboard/profile', { profile: data, roles: auth.user?.roles })
  }

  async update({ bouncer, request, response, auth }: HttpContext) {
    try {
      const userId = auth.user?.id
      const payload = await request.validateUsing(updateProfileValidator)
      await bouncer.with('ProfilePolicy').authorize('update', userId!, request)

      let media: Media | null = null
      const profile = await this.profileSvc.findByUid(userId!)

      if (payload.avatar)
        media = await this.mediaSvc.replaceById(payload.avatar, {
          id: profile?.avatar_id!,
          keyPrefix: userId!,
          tags: ['avatar'],
        })

      await this.profileSvc.update(userId!, { ...payload, avatar_id: media?.id })
      await this.activityLogSvc.log(
        auth.user!.id,
        'update_profile',
        `Updated profile:\n\`\`\`\n${auth.user!.email} [${auth.user!.id}]\n\`\`\``,
        getRequestFingerprint(request)
      )

      return response.status(200).json({
        status: 'success',
        message: `Successfully ${getMethodActName(request)} user.`,
      })
    } catch (error) {
      return returnError(response, error, `PROFILE_UPDATE`, { logErrors: true })
    }
  }

  async getAvatarAPI({ bouncer, auth, response }: HttpContext) {
    try {
      const userId = auth.user?.id
      await bouncer.with('ProfilePolicy').authorize('view', userId!)

      const profile = await this.profileSvc.findByUid(userId!)
      const url = await cache.getOrSet({
        key: 'media-' + profile?.avatar_id, // since we use the avatar id as the key, if the avatar is changed, the cache will be invalidated
        ttl: '1h',
        factory: async () => {
          return await this.mediaSvc.getMediaURLById(profile?.avatar_id!)
        },
        onFactoryError(error) {
          logger.error(error, 'PROFILE_GET_AVATAR_FACTORY_ERROR ' + userId!)
        },
      })

      return response.status(200).json({
        status: 'success',
        data: url,
      })
    } catch (error) {
      return returnError(response, error, `PROFILE_GET_AVATAR`, { logErrors: true })
    }
  }
}
