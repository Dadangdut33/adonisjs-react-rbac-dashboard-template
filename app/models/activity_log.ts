import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

import SnakeCaseNamingStrategy from './_naming_strategy.js'
import User from './user.js'

export default class ActivityLog extends BaseModel {
  static namingStrategy = new SnakeCaseNamingStrategy()
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: string | null

  @column()
  declare action: string

  @column()
  declare target: string

  @column({
    serialize: (value) => JSON.parse(value),
  })
  declare metadata: Object | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
