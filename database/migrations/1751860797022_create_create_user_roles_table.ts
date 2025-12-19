import Tables from '#enums/tables'

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = Tables.USER_ROLES

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('user_id').references('id').inTable(Tables.USERS).onDelete('CASCADE')
      table.integer('role_id').unsigned().references('id').inTable(Tables.ROLES).onDelete('CASCADE')

      table.primary(['user_id', 'role_id'])

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
