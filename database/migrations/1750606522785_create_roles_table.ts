import Roles from '#enums/roles'
import Tables from '#enums/tables'

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = Tables.ROLES

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name', 50).notNullable()
      table.boolean('is_protected').notNullable().defaultTo(false)

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    // Define 3 default roles that is protected
    // So that they may never be deleted or modified
    this.defer(async (query) => {
      await query.table(this.tableName).multiInsert([
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
      ])

      console.log('Roles created')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
