import vine from '@vinejs/vine'

import { emailValidator, passwordRegex, transformFullName, transformUsername } from './_shared.js'

// Create user by admin or edit user by admin
export const createEditUserValidator = vine.compile(
  vine.object({
    id: vine.string().uuid().optional(),
    full_name: vine.string().minLength(3).maxLength(128).trim().transform(transformFullName),
    username: vine.string().minLength(3).maxLength(128).trim().transform(transformUsername),
    email: emailValidator,
    avatar: vine.file({ extnames: ['jpg', 'jpeg', 'png'], size: '3mb' }).optional(),
    avatar_id: vine.string().uuid().optional(), // set in backend
    avatar_clear: vine.boolean().optional(), // flag to clear / delete avatar
    password: vine
      .string()
      .minLength(8)
      .maxLength(255)
      .regex(passwordRegex)
      .confirmed({ confirmationField: 'password_confirmation' })
      .optional(),
    is_email_verified: vine.boolean().optional(),
    // roles is array of role ids
    roleIds: vine.array(vine.number()),
  })
)
