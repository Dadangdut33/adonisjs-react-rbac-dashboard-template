import Tables from '#enums/tables'

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = Tables.PERMISSIONS

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name').notNullable().unique()
      table.boolean('is_protected').notNullable().defaultTo(false)

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    // Define 3 default permission that is protected
    // So that they may never be deleted or modified
    this.defer(async (query) => {
      const prefixes = ['user', 'role', 'permission']
      const permissionType = ['view', 'create', 'update', 'delete']
      const permissions = prefixes.flatMap((prefix) =>
        permissionType.map((type) => ({ name: `${prefix}.${type}`, is_protected: true }))
      )

      await query.table(this.tableName).multiInsert(permissions)

      console.log('Permissions created')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
