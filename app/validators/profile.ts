import vine from '@vinejs/vine'

// Create user by admin or edit user by admin
export const updateProfileValidator = vine.compile(
  vine.object({
    bio: vine.string().trim().maxLength(500).optional(),
  })
)
