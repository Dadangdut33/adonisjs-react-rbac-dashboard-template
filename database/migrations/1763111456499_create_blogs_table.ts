import Tables from '#enums/tables'

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = Tables.BLOGS

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.string('slug_id').notNullable()

      table.string('title').notNullable()
      table.uuid('thumbnail_id').nullable()
      table.foreign('thumbnail_id').references('id').inTable(Tables.MEDIAS).onDelete('SET NULL')
      table.text('description').nullable()
      table.json('content').notNullable()
      table.json('tags').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
