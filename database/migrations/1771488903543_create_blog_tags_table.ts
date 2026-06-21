import Tables from '#enums/tables'

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = Tables.BLOG_TAGS

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('blog_id').notNullable().references('id').inTable(Tables.BLOGS).onDelete('CASCADE')
      table.uuid('tag_id').notNullable().references('id').inTable(Tables.TAGS).onDelete('CASCADE')
      table.primary(['blog_id', 'tag_id'])

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
