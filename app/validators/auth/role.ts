import Tables from '#enums/tables'

import vine from '@vinejs/vine'

export const createEditRoleValidator = vine.compile(
  vine.object({
    id: vine.number().positive().optional(),
    name: vine.string(),
    permissionIds: vine.array(vine.number().unique({ table: Tables.PERMISSIONS, column: 'id' })),
  })
)
