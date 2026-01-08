import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'

import SnakeCaseNamingStrategy from './_naming_strategy.js'
import User from './user.js'

export default class Token extends BaseModel {
  static namingStrategy = new SnakeCaseNamingStrategy()
  static selfAssignPrimaryKey = true
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare user_id: string | null

  @column()
  declare type: string

  @column()
  declare token: string

  @column.dateTime()
  declare expires_at: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime

  @belongsTo(() => User, {
    foreignKey: 'user_id',
  })
  declare user: BelongsTo<typeof User>

  @beforeCreate()
  static assignUuid(token: Token) {
    token.id = randomUUID()
  }
}
