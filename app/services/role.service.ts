import Role from '#models/role'
import RoleRepository from '#repositories/role.repository'
import { QueryBuilderParams } from '#types/app'
import { RolePayload } from '#types/inferred'

import { inject } from '@adonisjs/core'

@inject()
export default class RoleService {
  constructor(protected repo: RoleRepository) {}

  async index(queryParams: QueryBuilderParams<typeof Role>) {
    const q = this.repo.query(queryParams)
    return await this.repo.paginate(q, queryParams)
  }

  async create(data: RolePayload) {
    return this.repo.createRole(data)
  }

  async update(role: Role, data: RolePayload) {
    return this.repo.updateRole(role, data)
  }

  async findOrFail(value: any) {
    return this.repo.findOrFail(value)
  }

  async deleteRole(id: any) {
    return this.repo.deleteGeneric(id)
  }
}
