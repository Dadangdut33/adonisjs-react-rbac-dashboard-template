import vine from '@vinejs/vine'

export const createEditPermissionValidator = vine.create(
  vine.object({
    id: vine.number().positive().optional(),
    name: vine.string().trim().minLength(3).maxLength(255),
  })
)
