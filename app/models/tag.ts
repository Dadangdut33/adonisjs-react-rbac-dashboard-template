import Tables from '#enums/tables'

import { BaseModel, beforeCreate, column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'

import Blog from './blog.js'
import BlogVersion from './blog_version.js'
import Media from './media.js'
import Role from './role.js'

export default class Tag extends BaseModel {
  static table = Tables.TAGS

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare type: 'blog' | 'media'

  @manyToMany(() => Blog, {
    pivotTable: Tables.BLOG_TAGS,
    pivotForeignKey: 'tag_id',
    pivotRelatedForeignKey: 'blog_id',
  })
  declare blogs: ManyToMany<typeof Blog>

  @manyToMany(() => BlogVersion, {
    pivotTable: Tables.BLOG_VERSION_TAGS,
    pivotForeignKey: 'tag_id',
    pivotRelatedForeignKey: 'blog_version_id',
  })
  declare blog_versions: ManyToMany<typeof BlogVersion>

  @manyToMany(() => Media, {
    pivotTable: Tables.MEDIA_TAGS,
    pivotForeignKey: 'tag_id',
    pivotRelatedForeignKey: 'media_id',
  })
  declare medias: ManyToMany<typeof Media>

  @manyToMany(() => Role, {
    pivotTable: Tables.ROLE_MEDIA_TAGS,
    pivotForeignKey: 'tag_id',
    pivotRelatedForeignKey: 'role_id',
  })
  declare roles: ManyToMany<typeof Role>

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime | null

  @beforeCreate()
  static assignUuid(self: Tag) {
    self.id = randomUUID()
  }
}
