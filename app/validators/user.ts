import vine from '@vinejs/vine'

import { emailValidator } from './_shared.js'

// Create user by admin or edit user by admin
export const createEditUserValidator = vine.compile(
  vine.object({
    id: vine.string().uuid().optional(),
    username: vine.string().trim().toLowerCase(),
    full_name: vine.string().trim(),
    email: emailValidator,
    avatar: vine.file({ extnames: ['jpg', 'jpeg', 'png'], size: '3mb' }).optional(),
    avatar_id: vine.string().uuid().optional(), // set in backend
    avatar_clear: vine.boolean().optional(), // flag to clear / delete avatar
    password: vine
      .string()
      .minLength(8)
      .maxLength(255)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,255}$/)
      .confirmed({ confirmationField: 'password_confirmation' })
      .optional(),
    is_email_verified: vine.boolean().optional(),
    // roles is array of role ids
    roleIds: vine.array(vine.number()),
  })
)
