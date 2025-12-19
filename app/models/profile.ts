import Tables from '#enums/tables'

import { BaseModel, beforeCreate, belongsTo, column, hasOne } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasOne } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'

import SnakeCaseNamingStrategy from './_naming_strategy.js'
import Media from './media.js'
import User from './user.js'

export default class Profile extends BaseModel {
  static namingStrategy = new SnakeCaseNamingStrategy()
  static table = Tables.USER_PROFILES
  static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare avatar_id: string | null

  @column()
  declare bio: string

  @column()
  declare user_id: string

  @belongsTo(() => User, {
    foreignKey: 'user_id',
  })
  declare user: BelongsTo<typeof User>

  @hasOne(() => Media, {
    foreignKey: 'avatar_id',
  })
  declare avatar: HasOne<typeof Media>

  @column.dateTime({ autoCreate: true, serializeAs: null })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  declare updated_at: DateTime | null

  @beforeCreate()
  static assignUuid(profile: Profile) {
    profile.id = randomUUID()
  }
}
