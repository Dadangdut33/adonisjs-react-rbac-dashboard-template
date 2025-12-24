import Profile from '#models/profile'
import { UpdateProfilePayload } from '#types/inferred'

import BaseRepository from './_base_repository.js'

export default class ProfileRepository extends BaseRepository<typeof Profile> {
  constructor() {
    super(Profile)
  }

  async updateProfile(user_id: string, data: UpdateProfilePayload) {
    const profile = await this.model.updateOrCreate(
      { user_id }, // search criteria
      data // data to update or create
    )

    return profile
  }

  async getAvatar(user_id: string) {
    const profile = await this.model.query().where('user_id', user_id).first()

    return profile?.avatar
  }
}
