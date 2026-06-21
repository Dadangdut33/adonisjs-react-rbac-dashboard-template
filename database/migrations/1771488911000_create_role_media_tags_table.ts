import Tables from '#enums/tables'

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = Tables.ROLE_MEDIA_TAGS

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.integer('role_id').unsigned().references('id').inTable(Tables.ROLES).onDelete('CASCADE')
      table.uuid('tag_id').references('id').inTable(Tables.TAGS).onDelete('CASCADE')
      table.primary(['role_id', 'tag_id'])

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
