import Role from '#models/role'
import PermissionRepository from '#repositories/permission.repository'
import RoleRepository from '#repositories/role.repository'
import { QueryBuilderParams } from '#types/app'
import { RolePayload } from '#types/inferred'

import { inject } from '@adonisjs/core'

@inject()
export default class RoleService {
  constructor(
    protected repo: RoleRepository,
    protected permRepo: PermissionRepository
  ) {}

  async index(queryParams: QueryBuilderParams<typeof Role>) {
    const q = this.repo.query(queryParams)
    return await this.repo.paginate(q, queryParams)
  }

  async list() {
    return this.repo.getList()
  }

  async listNoAdmin() {
    return this.repo.getListNoAdmin()
  }

  async listWithCheck(userRoles: Role[]) {
    if (userRoles.some((role) => role.name === 'Super Admin')) {
      return this.repo.getList()
    } else {
      return this.repo.getListNoAdmin()
    }
  }

  async create(data: RolePayload) {
    return this.repo.createRole(data)
  }

  async update(role: Role, data: RolePayload) {
    // if role is protected. We MUST make sure that the name is not changed
    if (role.is_protected) {
      data.name = role.name // this is because we use the name for some internal logic
    }

    if (role.name === 'Super Admin') {
      // if the role is Super Admin, we must make sure that the critical permissions are not changed
      const criticalPermissions = await this.permRepo.getCriticalPermissions()
      const criticalPermissionIds = criticalPermissions.map((perm) => perm.id)

      // merge the critical permission ids with the provided permission ids
      const providedPermissionIds = data.permissionIds || []
      const mergedPermissionIds = Array.from(
        new Set([...providedPermissionIds, ...criticalPermissionIds])
      )
      data.permissionIds = mergedPermissionIds
    }

    return this.repo.updateRole(role, data)
  }

  async findOrFail(value: any) {
    return this.repo.findOrFail(value)
  }

  async deleteRole(id: any) {
    return this.repo.deleteGeneric(id)
  }
}
