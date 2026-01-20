import PreDefinedRolesId from '#enums/roles'
import { generateRandomPassword } from '#lib/utils'
import Profile from '#models/profile'
import User from '#models/user'

import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    try {
      const randomPassword = generateRandomPassword()

      const user = await User.create({
        full_name: 'Super Admin',
        username: 'SuperAdmin',
        email: 'superadmin@example.local',
        password: randomPassword,
        is_email_verified: true,
      })

      await user.related('roles').attach([PreDefinedRolesId.SUPER_ADMIN])

      // create empty profile
      await Profile.create({
        user_id: user.id,
      })

      console.log('Super admin user created, with password: ' + randomPassword)
    } catch (error) {
      console.log('That user already exists, skipping super admin user creation.')
    }
  }
}
