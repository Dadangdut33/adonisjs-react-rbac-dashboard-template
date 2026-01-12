import ProfileRepository from '#repositories/profile.repository'
import { CreateProfilePayload, UpdateProfilePayload } from '#types/inferred'

import { inject } from '@adonisjs/core'

@inject()
export default class ProfileService {
  constructor(protected repo: ProfileRepository) {}

  async findByUid(id: string) {
    return await this.repo.findBy('user_id', id)
  }

  async create(data: CreateProfilePayload) {
    const { avatar, ...rest } = data
    return this.repo.createGeneric({
      ...rest,
      user_id: data.user_id,
    })
  }

  async update(user_id: string, data: UpdateProfilePayload) {
    return this.repo.updateProfile(user_id, data)
  }

  async getAvatar(user_id: string) {
    return this.repo.getAvatar(user_id)
  }
}
