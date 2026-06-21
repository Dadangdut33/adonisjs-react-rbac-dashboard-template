import Role from '#models/role'

import { PermissionDto } from './permission.dto.js'
import { TagDto } from './tag.dto.js'

export class RoleDto {
  readonly id: number
  readonly name: string
  readonly is_protected: boolean
  readonly can_access_all_media_tags: boolean
  readonly created_at: string // dto needs to be string
  readonly updated_at: string
  readonly permissions?: PermissionDto[] // we can actually store just the id like number[] if we want to
  readonly media_tags?: TagDto[]
  // if we do that then we just need to match it in the constructor

  constructor(role: Role) {
    this.id = role.id
    this.name = role.name
    this.is_protected = role.is_protected
    this.can_access_all_media_tags = role.can_access_all_media_tags
    this.created_at = role.created_at ? role.created_at.toString() : ''
    this.updated_at = role.updated_at ? role.updated_at.toString() : ''
    this.permissions = role.permissions
      ? role.permissions.map((perm) => new PermissionDto(perm))
      : []
    this.media_tags = role.media_tags ? TagDto.collect(role.media_tags) : []
  }

  // Collect is for multiple dtos
  static collect(roles: Role[]): RoleDto[] {
    return roles.map((role) => new RoleDto(role))
  }
}
