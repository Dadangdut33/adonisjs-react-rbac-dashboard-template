import Tables from '#enums/tables'

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = Tables.MEDIAS

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      // key stored in drive to get the file
      table.string('drive_key').notNullable()

      table.string('mime_type').notNullable()
      table.string('name').notNullable()
      table.string('extension').notNullable()
      table.integer('size').notNullable()
      table.string('hash').notNullable()
      table.json('tags').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
