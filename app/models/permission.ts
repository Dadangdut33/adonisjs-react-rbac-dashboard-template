import Tables from '#enums/tables'

import { BaseModel, beforeDelete, column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

import SnakeCaseNamingStrategy from './_naming_strategy.js'
import Role from './role.js'

export default class Permission extends BaseModel {
  static namingStrategy = new SnakeCaseNamingStrategy()
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  // * A special role that should always be there. it is protected from deletion and modification
  // ! flagged from db directly.
  @column()
  declare is_protected: boolean

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime

  @manyToMany(() => Role, {
    pivotTable: Tables.ROLE_PERMISSIONS,
  })
  declare roles: ManyToMany<typeof Role>

  @beforeDelete()
  public static preventProtectedDelete(permission: Permission) {
    if (permission.is_protected) {
      throw new Error('Cannot delete a protected permission')
    }
  }
}
