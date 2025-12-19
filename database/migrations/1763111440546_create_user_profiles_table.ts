import Tables from '#enums/tables'

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = Tables.USER_PROFILES

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('user_id').references('id').inTable(Tables.USERS).onDelete('CASCADE')
      table.uuid('avatar_id').nullable()
      table.foreign('avatar_id').references('id').inTable(Tables.MEDIAS).onDelete('SET NULL')

      table.text('bio').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
