import Permission from '#models/permission'

import BaseRepository from './_base_repository.js'

export default class PermissionRepository extends BaseRepository<typeof Permission> {
  constructor() {
    super(Permission)
  }
}
