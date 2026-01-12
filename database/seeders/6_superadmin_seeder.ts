import PreDefinedRolesId from '#enums/roles'
import Profile from '#models/profile'
import User from '#models/user'

import { BaseSeeder } from '@adonisjs/lucid/seeders'
import crypto from 'node:crypto'

export default class extends BaseSeeder {
  async run() {
    try {
      const randomPassword = crypto
        .randomBytes(32)
        .toString('base64url') // safe for logs, URLs, env vars
        .slice(0, 32)

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
