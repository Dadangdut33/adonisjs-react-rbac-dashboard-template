import Tables from '#enums/tables'

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = Tables.BLOG_VERSION_TAGS

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table
        .uuid('blog_version_id')
        .notNullable()
        .references('id')
        .inTable(Tables.BLOG_VERSIONS)
        .onDelete('CASCADE')
      table.uuid('tag_id').notNullable().references('id').inTable(Tables.TAGS).onDelete('CASCADE')
      table.primary(['blog_version_id', 'tag_id'])

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    this.schema.alterTable(Tables.BLOG_VERSIONS, (table) => {
      table.dropColumn('tags')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
