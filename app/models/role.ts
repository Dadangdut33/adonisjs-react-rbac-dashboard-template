import Tables from '#enums/tables'

import { BaseModel, beforeDelete, column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

import SnakeCaseNamingStrategy from './_naming_strategy.js'
import Permission from './permission.js'
import User from './user.js'

// We must have predefined roles in #enums/roles.ts
// It is created as flexible while also making it easy to manage roles
// If we want to modify the value
export default class Role extends BaseModel {
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

  @manyToMany(() => User, {
    pivotTable: Tables.USER_ROLES,
  })
  declare users: ManyToMany<typeof User>

  @manyToMany(() => Permission, {
    pivotTable: Tables.ROLE_PERMISSIONS,
  })
  declare permissions: ManyToMany<typeof Permission>

  @beforeDelete()
  public static preventProtectedDelete(role: Role) {
    if (role.is_protected) {
      throw new Error('Cannot delete a protected role')
    }
  }
}
