import Role from '#models/role'
import { RolePayload } from '#types/inferred'

import BaseRepository from './_base_repository.js'

export default class RoleRepository extends BaseRepository<typeof Role> {
  constructor() {
    super(Role)
  }

  async createRole(data: RolePayload) {
    const role = await this.model.create(data)

    // sync the roles
    if (data.permissionIds) await role.related('permissions').sync(data.permissionIds)

    return role
  }

  async updateRoleWithModel(role: Role, data: RolePayload) {
    role.merge(data)
    await role.save()

    // sync the roles
    if (data.permissionIds) await role.related('permissions').sync(data.permissionIds)

    return role
  }
}
