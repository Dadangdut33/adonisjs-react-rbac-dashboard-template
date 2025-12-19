import Roles from '#enums/roles'
import Tables from '#enums/tables'

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = Tables.ROLE_PERMISSIONS

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.integer('role_id').unsigned().references('id').inTable(Tables.ROLES).onDelete('CASCADE')
      table
        .integer('permission_id')
        .unsigned()
        .references('id')
        .inTable(Tables.PERMISSIONS)
        .onDelete('CASCADE')
      table.primary(['role_id', 'permission_id'])

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    // Assign the super admin role to all permission that we created
    this.defer(async (query) => {
      const permissions = await query.table(Tables.PERMISSIONS)
      const superAdminId = Roles.SUPER_ADMIN

      // Data
      const data = permissions.map((permission) => ({
        role_id: superAdminId,
        permission_id: permission.id,
      }))

      await query.table(this.tableName).multiInsert(data)

      console.log('Permissions assigned to super admin role')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
