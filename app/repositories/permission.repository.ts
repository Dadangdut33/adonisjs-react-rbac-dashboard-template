import Permission from '#models/permission'

import BaseRepository from './_base_repository.js'

export default class PermissionRepository extends BaseRepository<typeof Permission> {
  constructor() {
    super(Permission)
  }

  async updatePermission(permission: InstanceType<typeof Permission>, data: any) {
    // first make sure that the permission is not protected
    if (permission.is_protected) throw new Error('Permission is protected')

    return this.updateGeneric(permission, data)
  }

  async getCriticalPermissions() {
    const toSearchNamePrefixes = ['role', 'permission', 'user']
    return this.model.query().whereIn('name', toSearchNamePrefixes)
  }

  async getListIdNames() {
    return this.model.query().select('id', 'name')
  }

  async getListGroupedByBaseName() {
    const permissions = await this.model.query().select('id', 'name')

    const grouped: Record<string, { id: number; name: string }[]> = {}

    permissions.forEach((perm) => {
      const baseName = perm.name.split('.')[0]
      if (!grouped[baseName]) {
        grouped[baseName] = []
      }
      grouped[baseName].push({ id: perm.id, name: perm.name })
    })

    return grouped
  }
}
