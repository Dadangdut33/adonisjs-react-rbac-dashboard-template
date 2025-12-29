import Tables from '#enums/tables'

import vine from '@vinejs/vine'

import { emailValidator } from './_shared.js'

// Create user by admin or edit user by admin
export const createEditUserValidator = vine.compile(
  vine.object({
    id: vine.string().uuid().optional(),
    username: vine.string().trim().toLowerCase(),
    full_name: vine.string().trim(),
    email: emailValidator,
    password: vine
      .string()
      .minLength(8)
      .maxLength(255)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,255}$/)
      .optional(),
    is_email_verified: vine.boolean().optional(),
    // roles is array of role ids
    roleIds: vine.array(vine.number().unique({ table: Tables.ROLES, column: 'id' })),
  })
)
