import Tables from '#enums/tables'

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = Tables.MEDIA_TAGS

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table
        .uuid('media_id')
        .notNullable()
        .references('id')
        .inTable(Tables.MEDIAS)
        .onDelete('CASCADE')
      table.uuid('tag_id').notNullable().references('id').inTable(Tables.TAGS).onDelete('CASCADE')
      table.primary(['media_id', 'tag_id'])

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
