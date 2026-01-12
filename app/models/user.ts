import Tables from '#enums/tables'

import { AccessToken, DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { compose } from '@adonisjs/core/helpers'
import hash from '@adonisjs/core/services/hash'
import {
  BaseModel,
  beforeCreate,
  column,
  computed,
  hasMany,
  hasOne,
  manyToMany,
} from '@adonisjs/lucid/orm'
import type { HasMany, HasOne, ManyToMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'

import SnakeCaseNamingStrategy from './_naming_strategy.js'
import Profile from './profile.js'
import Role from './role.js'
import Token from './token.js'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  static namingStrategy = new SnakeCaseNamingStrategy()
  static selfAssignPrimaryKey = true
  static accessTokens = DbAccessTokensProvider.forModel(User, {
    table: Tables.ACCESS_TOKEN,
  })
  currentAccessToken?: AccessToken

  @column({ isPrimary: true })
  declare id: string

  @column({
    prepare: (value: string) => value.trim().toLowerCase(),
  })
  declare username: string

  @column({
    prepare: (value: string) => value.trim(),
  })
  declare full_name: string

  @column({
    prepare: (value: string) => value.trim().toLowerCase(),
  })
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare is_email_verified: boolean

  @column.dateTime({ autoCreate: true, serializeAs: null })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  declare updated_at: DateTime | null

  @computed()
  public get isAdmin() {
    return this.roles?.some((role) => role.name === 'ADMIN') ?? false
  }

  @computed()
  public get isSuperAdmin() {
    return this.roles?.some((role) => role.name === 'SUPER_ADMIN') ?? false
  }

  @manyToMany(() => Role, {
    pivotTable: Tables.USER_ROLES,
    localKey: 'id',
    pivotForeignKey: 'user_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'role_id',
  })
  declare roles: ManyToMany<typeof Role>

  @hasMany(() => Token)
  declare tokens: HasMany<typeof Token>

  @hasMany(() => Token, {
    onQuery: (query) => query.where('type', 'PASSWORD_RESET'),
  })
  declare passwordResetTokens: HasMany<typeof Token>

  @hasMany(() => Token, {
    onQuery: (query) => query.where('type', 'VERIFY_EMAIL'),
  })
  declare verifyEmailTokens: HasMany<typeof Token>

  @hasOne(() => Profile, {
    foreignKey: 'user_id',
  })
  declare profile: HasOne<typeof Profile>

  @beforeCreate()
  static assignUuid(self: User) {
    self.id = randomUUID()
  }
}
