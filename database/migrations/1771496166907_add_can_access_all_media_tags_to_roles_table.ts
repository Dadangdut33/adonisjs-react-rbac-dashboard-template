import Tables from '#enums/tables'

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = Tables.ROLES

  async up() {
    const hasColumn = await this.schema.hasColumn(this.tableName, 'can_access_all_media_tags')
    if (!hasColumn) {
      this.schema.alterTable(this.tableName, (table) => {
        table.boolean('can_access_all_media_tags').notNullable().defaultTo(false)
      })
    }
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('can_access_all_media_tags')
    })
  }
}
