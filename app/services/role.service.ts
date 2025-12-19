import Role from '#models/role'
import RoleRepository from '#repositories/role.repository'
import { QueryBuilderParams } from '#types/app'
import { RolePayload } from '#types/inferred'

import { inject } from '@adonisjs/core'

@inject()
export default class RoleService {
  constructor(protected repo: RoleRepository) {}

  async index(queryParams: QueryBuilderParams<typeof Role>) {
    return await this.repo.query(queryParams)
  }

  async create(data: RolePayload) {
    return this.repo.createRole(data)
  }

  async updateWithModel(role: Role, data: RolePayload) {
    if (role.is_protected) {
      data.name = role.name // if protected, we must not update the name
    }

    return this.repo.updateRoleWithModel(role, data)
  }

  async findOrFail(value: any) {
    return this.repo.findOrFail(value)
  }

  async deleteRole(id: any) {
    return this.repo.deleteGeneric(id)
  }
}
