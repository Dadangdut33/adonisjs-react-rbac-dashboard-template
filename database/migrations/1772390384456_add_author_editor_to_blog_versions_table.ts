import Tables from '#enums/tables'

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = Tables.BLOG_VERSIONS

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.uuid('author_id').nullable()
      table.uuid('editor_id').nullable()

      table.foreign('author_id').references('id').inTable(Tables.USERS).onDelete('SET NULL')
      table.foreign('editor_id').references('id').inTable(Tables.USERS).onDelete('SET NULL')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign(['author_id'])
      table.dropForeign(['editor_id'])
      table.dropColumn('author_id')
      table.dropColumn('editor_id')
    })
  }
}
