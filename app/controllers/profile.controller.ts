import { getMethodActName } from '#lib/utils'
import Media from '#models/media'
import MediaService from '#services/media.service'
import PermissionCheckService from '#services/permission_check.service'
import ProfileService from '#services/profile.service'
import { updateProfileValidator } from '#validators/profile'

import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'

@inject()
export default class ProfileController {
  constructor(
    protected profileSvc: ProfileService,
    protected mediaSvc: MediaService,
    protected permChecker: PermissionCheckService
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
      const data = await request.validateUsing(updateProfileValidator)
      await bouncer.with('ProfilePolicy').authorize('update', userId!, request)

      let media: Media | null = null
      const profile = await this.profileSvc.findByUid(userId!)

      if (data.avatar)
        media = await this.mediaSvc.replaceById(data.avatar, {
          id: profile?.avatar_id!,
          keyPrefix: userId!,
        })

      await this.profileSvc.update(userId!, { ...data, avatar_id: media?.id })

      return response.status(200).json({
        status: 'success',
        message: `Successfully ${getMethodActName(request)} user.`,
      })
    } catch (error) {
      return response.status(error.status || 500).json({
        status: 'error',
        message: error.messages?.[0]?.message || error.message || 'Something went wrong',
      })
    }
  }

  async getAvatar({ bouncer, auth, response }: HttpContext) {
    try {
      const userId = auth.user?.id
      await bouncer.with('ProfilePolicy').authorize('view', userId!)

      const profile = await this.profileSvc.findByUid(userId!)
      const url = await this.mediaSvc.getMediaURLById(profile?.avatar_id!)

      return response.status(200).json({
        status: 'success',
        data: url,
      })
    } catch (error) {
      return response.status(error.status || 500).json({
        status: 'error',
        message: error.messages?.[0]?.message || error.message || 'Something went wrong',
      })
    }
  }
}
