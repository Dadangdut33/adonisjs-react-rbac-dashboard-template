import Tables from '#enums/tables'

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = Tables.ACTIVITY_LOGS

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.uuid('user_id').nullable().references('id').inTable('users').onDelete('SET NULL')
      table.string('action').notNullable()
      table.text('target').notNullable()
      table.json('metadata').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
