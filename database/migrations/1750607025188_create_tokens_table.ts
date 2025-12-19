import Tables from '#enums/tables'

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = Tables.TOKENS

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id')
      table.uuid('user_id').references('id').inTable(Tables.USERS).onDelete('CASCADE')
      table.string('type').notNullable()
      table.string('token', 64).notNullable()

      table.timestamp('expires_at')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
