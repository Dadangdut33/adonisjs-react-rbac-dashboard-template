import Role from '#models/role'
import { RolePayload } from '#types/inferred'

import BaseRepository from './_base_repository.js'

export default class RoleRepository extends BaseRepository<typeof Role> {
  constructor() {
    super(Role)
  }

  async getList() {
    return this.model.query().orderBy('name', 'asc')
  }

  async getListNoAdmin() {
    const dontIncludeNames = ['Super Admin', 'Admin']
    return this.model.query().whereNotIn('name', dontIncludeNames).orderBy('name', 'asc')
  }

  async createRole(data: RolePayload) {
    const { permissionIds = [], ...rest } = data

    const role = await this.model.create(rest)

    // sync the roles
    await role.related('permissions').sync(permissionIds)

    return role
  }

  async updateRole(role: Role, data: RolePayload) {
    const { permissionIds = [], ...rest } = data

    role.merge(rest)
    await role.save()

    // sync the roles
    await role.related('permissions').sync(permissionIds)

    return role
  }
}
