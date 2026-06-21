import Tables from '#enums/tables'

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = Tables.REMEMBER_ME_TOKEN

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .uuid('tokenable_id')
        .notNullable()
        .references('id')
        .inTable(Tables.USERS)
        .onDelete('CASCADE')

      table.string('hash').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
      table.timestamp('expires_at').notNullable()

      table.index(['tokenable_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
