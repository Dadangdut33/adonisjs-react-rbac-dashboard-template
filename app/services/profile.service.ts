import User from '#models/user'
import ProfileRepository from '#repositories/profile.repository'
import { QueryBuilderParams } from '#types/app'
import { ProfilePayload } from '#types/inferred'

import { inject } from '@adonisjs/core'

@inject()
export default class ProfileService {
  constructor(protected repo: ProfileRepository) {}

  async index(queryParams: QueryBuilderParams<typeof User>) {
    return await this.repo.query(queryParams)
  }

  async update(user_id: string, data: ProfilePayload) {
    return this.repo.updateProfile(user_id, data)
  }

  async getAvatar(user_id: string) {
    return this.repo.getAvatar(user_id)
  }
}
