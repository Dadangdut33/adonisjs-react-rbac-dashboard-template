import Roles from '#enums/roles'
import Permission from '#models/permission'
import Role from '#models/role'

import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    // get all permissions
    const permissions = await Permission.query()

    // get super admin role
    const superAdminId = Roles.SUPER_ADMIN
    const superAdminRole = await Role.query().where('id', superAdminId).first()

    // if no super admin role, throw error
    if (!superAdminRole) {
      throw new Error('Super admin role not found')
    }

    // we get all the permission ids and attach to super admin role
    const permIds = permissions.map((permission) => permission.id)

    // we first detach all permissions from super admin role
    await superAdminRole.related('permissions').detach()
    await superAdminRole.related('permissions').attach(permIds)

    console.log('Permissions assigned to superadmin role')
  }
}
