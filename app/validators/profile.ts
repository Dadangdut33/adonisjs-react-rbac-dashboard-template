import vine from '@vinejs/vine'

const base = {
  bio: vine.string().trim().maxLength(500).optional(),
  avatar: vine.file({ extnames: ['jpg', 'jpeg', 'png'] }).optional(),
}

export const updateProfileValidator = vine.compile(vine.object(base))

export const createProfileValidator = vine.compile(
  vine.object({
    ...base,
    user_id: vine.string().trim().uuid(),
  })
)
