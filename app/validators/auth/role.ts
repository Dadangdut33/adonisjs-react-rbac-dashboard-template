import vine from '@vinejs/vine'

export const createEditRoleValidator = vine.create(
  vine.object({
    id: vine.number().positive().optional(),
    name: vine.string().trim().minLength(3).maxLength(255),
    permissionIds: vine.array(vine.number()).optional(),
    mediaTagIds: vine.array(vine.string().uuid()).optional(),
    can_access_all_media_tags: vine.boolean().optional(),
  })
)
