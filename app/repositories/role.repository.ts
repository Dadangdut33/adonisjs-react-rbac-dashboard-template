import Role from '#models/role'
import { RolePayload } from '#types/inferred'

import BaseRepository from './_base_repository.js'

export default class RoleRepository extends BaseRepository<typeof Role> {
  constructor() {
    super(Role)
  }

  async createRole(data: RolePayload) {
    const { permissionIds = [], ...rest } = data

    const role = await this.model.create(rest)

    // sync the roles
    await role.related('permissions').sync(permissionIds)

    return role
  }

  async updateRole(role: Role, data: RolePayload) {
    // first make sure that the permission is not protected
    if (role.is_protected) throw new Error('Role is protected')

    const { permissionIds = [], ...rest } = data

    role.merge(rest)
    await role.save()

    // sync the roles
    await role.related('permissions').sync(permissionIds)

    return role
  }
}
