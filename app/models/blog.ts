import Tables from '#enums/tables'

import { BaseModel, beforeCreate, belongsTo, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import { nanoid } from 'nanoid'
import { randomUUID } from 'node:crypto'

import SnakeCaseNamingStrategy from './_naming_strategy.js'
import BlogVersion from './blog_version.js'
import Media from './media.js'
import Tag from './tag.js'
import User from './user.js'

export default class Blog extends BaseModel {
  static namingStrategy = new SnakeCaseNamingStrategy()
  static table = Tables.BLOGS

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare slug_id: string

  @column()
  declare title: string

  @column()
  declare is_active: boolean

  @column()
  declare is_pinned: boolean

  @column()
  declare thumbnail_id: string | null

  @column()
  declare description: string | null

  @column()
  declare author_id: string | null

  @column()
  declare editor_id: string | null

  @column({
    prepare: (value) => (typeof value === 'string' ? value : JSON.stringify(value)),
    consume: (value) => {
      if (value === null || value === undefined) return {}
      if (typeof value === 'string') return JSON.parse(value)
      if (typeof value === 'object') return value
      return {}
    },
  })
  declare content: Record<string, any>

  @belongsTo(() => Media, {
    foreignKey: 'thumbnail_id',
  })
  declare thumbnail: BelongsTo<typeof Media>

  @belongsTo(() => User, {
    foreignKey: 'author_id',
  })
  declare author: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'editor_id',
  })
  declare editor: BelongsTo<typeof User>

  @hasMany(() => BlogVersion, {
    foreignKey: 'blog_id',
  })
  declare versions: HasMany<typeof BlogVersion>

  @manyToMany(() => Tag, {
    pivotTable: Tables.BLOG_TAGS,
    pivotForeignKey: 'blog_id',
    pivotRelatedForeignKey: 'tag_id',
  })
  declare tags: ManyToMany<typeof Tag>

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime | null

  @beforeCreate()
  static assignUuid(self: Blog) {
    self.id = randomUUID()
    self.slug_id = nanoid(12)
  }
}
