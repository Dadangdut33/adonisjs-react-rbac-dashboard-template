import Tables from '#enums/tables'

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = Tables.BLOG_VERSIONS

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('blog_id').notNullable().references('id').inTable(Tables.BLOGS).onDelete('CASCADE')
      table.integer('version').unsigned().notNullable()
      table.string('change_type').notNullable()

      table.string('slug_id').notNullable()
      table.string('title').notNullable()
      table.uuid('thumbnail_id').nullable()
      table.foreign('thumbnail_id').references('id').inTable(Tables.MEDIAS).onDelete('SET NULL')
      table.text('description').nullable()
      table.json('content').notNullable()
      table.json('tags').nullable()
      table.json('changed_fields').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
      table.unique(['blog_id', 'version'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
