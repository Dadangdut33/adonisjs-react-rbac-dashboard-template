import Roles from '#enums/roles'
import Role from '#models/role'

import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    const payload = [
      {
        id: Roles.USER,
        name: 'User',
        is_protected: true,
      },
      {
        id: Roles.ADMIN,
        name: 'Admin',
        is_protected: true,
      },
      {
        id: Roles.SUPER_ADMIN,
        name: 'Super Admin',
        is_protected: true,
      },
    ]

    try {
      await Role.createMany(payload)
    } catch (error) {
      if (`${error}`.includes('duplicate key value violates unique constraint')) {
        console.log('Some roles already exist, skipping bulk insert. Trying one by one...')
      } else {
        console.log(error)
      }

      // if error means dupe. So we just go 1 by 1
      for (const p of payload) {
        try {
          await Role.create(p)
          console.log(`Created role: ${p.name}`)
        } catch (e) {
          if (!`${e}`.includes('duplicate key value violates unique constraint')) {
            console.log(e)
          }
        }
      }
    }

    console.log('Roles created')
  }
}
