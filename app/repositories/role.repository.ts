import Role from '#models/role'
import TagRepository from '#repositories/tag.repository'
import type { RolePayload } from '#types/inferred'

import BaseRepository from './_base_repository.js'

export default class RoleRepository extends BaseRepository<typeof Role> {
  protected tagRepo: TagRepository

  constructor() {
    super(Role)
    this.tagRepo = new TagRepository()
  }

  async getList() {
    return this.model.query().orderBy('name', 'asc')
  }

  async getListNoAdmin() {
    const dontIncludeNames = ['Super Admin', 'Admin']
    return this.model.query().whereNotIn('name', dontIncludeNames).orderBy('name', 'asc')
  }

  async createRole(data: RolePayload) {
    const { permissionIds = [], mediaTagIds = [], ...rest } = data

    const role = await this.model.create(rest)

    // sync role relations
    await role.related('permissions').sync(permissionIds)
    await role.related('media_tags').sync(mediaTagIds)
    await this.tagRepo.cleanupUnusedTags('media')

    return role
  }

  async updateRole(role: Role, data: RolePayload) {
    const { permissionIds = [], mediaTagIds = [], ...rest } = data

    role.merge(rest)
    await role.save()

    // sync role relations
    await role.related('permissions').sync(permissionIds)
    await role.related('media_tags').sync(mediaTagIds)
    await this.tagRepo.cleanupUnusedTags('media')

    return role
  }
}
