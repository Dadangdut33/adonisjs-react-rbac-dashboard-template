import Tables from '#enums/tables'

import router from '@adonisjs/core/services/router'
import { BaseModel, beforeCreate, column, computed } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'

import SnakeCaseNamingStrategy from './_naming_strategy.js'

export default class Media extends BaseModel {
  static namingStrategy = new SnakeCaseNamingStrategy()
  static table = Tables.MEDIAS
  static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare drive_key: string

  @column()
  declare mime_type: string

  @column()
  declare name: string

  @column()
  declare extension: string

  @column()
  declare size: number

  @column()
  declare hash: string

  @column()
  declare tags: string[] | null

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime | null

  @beforeCreate()
  static assignUuid(self: Media) {
    self.id = randomUUID()
  }

  @computed()
  public get url() {
    return router
      .builder()
      .params({ id: this.id })
      .makeSigned('api.v1.media.redirect', { expiresIn: '1h' })
  }
}
