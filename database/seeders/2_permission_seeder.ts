import Permission from '#models/permission'

import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    const prefixes = ['user', 'role', 'permission']
    const permissionType = ['view', 'create', 'update', 'delete']
    const manual = ['dashboard.view', 'profile.view', 'profile.update']
    const manualMapped = manual.map((manualName) => ({ name: manualName, is_protected: true }))

    const permissions = prefixes.flatMap((prefix) =>
      permissionType.map((type) => ({ name: `${prefix}.${type}`, is_protected: true }))
    )

    permissions.push(...manualMapped)

    try {
      await Permission.createMany(permissions)
    } catch (error) {
      if (`${error}`.includes('duplicate key value violates unique constraint')) {
        console.log('Some permissions already exist, skipping bulk insert. Trying one by one...')
      } else {
        console.log(error)
      }

      // if error means dupe. So we just go 1 by 1
      for (const permission of permissions) {
        try {
          await Permission.create(permission)
          console.log(`Created permission: ${permission.name}`)
        } catch (e) {
          if (!`${e}`.includes('duplicate key value violates unique constraint')) {
            console.log(e)
          }
        }
      }
    }

    console.log('Permissions created')
  }
}
