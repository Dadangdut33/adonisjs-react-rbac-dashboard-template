import Roles from '#enums/roles'
import Permission from '#models/permission'
import Role from '#models/role'

import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    // permissions for user role
    const permissionForUser = ['dashboard.view']
    const permissions = await Permission.query().where('name', 'in', permissionForUser)

    // get user role
    const userRoleId = Roles.USER
    const userRole = await Role.query().where('id', userRoleId).first()

    // if no role, throw error
    if (!userRole) {
      throw new Error('user role not found')
    }

    // we get all the permission ids and attach to user role
    const permIds = permissions.map((permission) => permission.id)

    // we first detach all permissions from user role
    await userRole.related('permissions').detach()
    await userRole.related('permissions').attach(permIds)

    console.log('Permissions assigned to user role')
  }
}
