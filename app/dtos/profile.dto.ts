import Profile from '#models/profile'

import { MediaDto } from './media.dto.js'

export class ProfileDto {
  readonly id: string
  readonly avatar_id?: string | null
  readonly bio: string
  readonly user_id: string
  readonly avatar?: MediaDto
  readonly created_at: string // dto needs to be string
  readonly updated_at: string

  constructor(profile: Profile) {
    this.id = profile.id
    this.avatar_id = profile.avatar_id
    this.bio = profile.bio
    this.user_id = profile.user_id
    this.avatar = profile.avatar ? new MediaDto(profile.avatar) : undefined
    this.created_at = profile.created_at.toString()
    this.updated_at = profile.updated_at ? profile.updated_at.toString() : ''
  }

  // Collect is for multiple dtos
  static collect(profiles: Profile[]): ProfileDto[] {
    return profiles.map((profile) => new ProfileDto(profile))
  }
}
