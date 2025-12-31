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
}
