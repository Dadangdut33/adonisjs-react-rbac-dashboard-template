import Permission from '#models/permission'
import PermissionRepository from '#repositories/permission.repository'
import { QueryBuilderParams } from '#types/app'
import { PermissionPayload } from '#types/inferred'

import { inject } from '@adonisjs/core'

@inject()
export default class PermissionService {
  constructor(protected repo: PermissionRepository) {}

  async index(queryParams: QueryBuilderParams<typeof Permission>) {
    const q = this.repo.query(queryParams)
    return await this.repo.paginate(q, queryParams)
  }

  async create(data: PermissionPayload) {
    return this.repo.createGeneric(data)
  }

  async update(permission: Permission, data: PermissionPayload) {
    return this.repo.updatePermission(permission, data)
  }

  async findOrFail(value: any) {
    return this.repo.findOrFail(value)
  }

  async deletePermission(id: any) {
    return this.repo.deleteGeneric(id)
  }
}
