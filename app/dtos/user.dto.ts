import User from '#models/user'

import { ProfileDto } from './profile.dto.js'
import { RoleDto } from './role.dto.js'
import { TokenDto } from './token.dto.js'

export class UserDto {
  readonly id: string
  readonly full_name: string
  readonly email: string
  readonly is_email_verified: boolean
  readonly created_at: string // dto needs to be string
  readonly updated_at: string
  readonly roles?: RoleDto[]
  readonly profile?: ProfileDto
  readonly tokens?: TokenDto[]
  readonly passwordResetTokens?: TokenDto[]
  readonly verifyEmailTokens?: TokenDto[]

  constructor(user: User) {
    this.id = user.id
    this.full_name = user.full_name
    this.email = user.email
    this.is_email_verified = user.is_email_verified
    this.created_at = user.created_at.toString()
    this.updated_at = user.updated_at ? user.updated_at.toString() : ''
    this.roles = user.roles ? RoleDto.collect(user.roles) : undefined
    this.profile = user.profile ? new ProfileDto(user.profile) : undefined
    this.tokens = user.tokens ? TokenDto.collect(user.tokens) : undefined
    this.passwordResetTokens = user.passwordResetTokens
      ? TokenDto.collect(user.passwordResetTokens)
      : undefined
    this.verifyEmailTokens = user.verifyEmailTokens
      ? TokenDto.collect(user.verifyEmailTokens)
      : undefined
  }

  // Collect is for multiple dtos
  static collect(users: User[]): UserDto[] {
    return users.map((user) => new UserDto(user))
  }
}
