import Tables from '#enums/tables'

import router from '@adonisjs/core/services/router'
import { BaseModel, beforeCreate, belongsTo, column, computed } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
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

  @belongsTo(() => Media, {
    foreignKey: 'avatar_id',
  })
  declare avatar?: BelongsTo<typeof Media>

  @computed()
  public get avatarUrl() {
    if (!this.avatar_id) return null
    return router
      .builder()
      .params({ id: this.avatar_id })
      .makeSigned('api.v1.media.redirect', { expiresIn: '1h' })
  }

  @column.dateTime({ autoCreate: true, serializeAs: null })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  declare updated_at: DateTime | null

  @beforeCreate()
  static assignUuid(profile: Profile) {
    profile.id = randomUUID()
  }
}
