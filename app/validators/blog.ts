import vine from '@vinejs/vine'

export const createEditBlogValidator = vine.create(
  vine.object({
    id: vine.string().uuid().optional(),
    title: vine.string().trim().minLength(1).maxLength(255),
    is_active: vine.boolean().optional(),
    is_pinned: vine.boolean().optional(),
    thumbnail_id: vine.string().uuid().nullable().optional(),
    description: vine.string().trim().nullable().optional(),
    content: vine.object({}).allowUnknownProperties(),
    tags: vine.array(vine.string().trim()).optional(),
    projectIds: vine.array(vine.string().uuid()).optional(),
  })
)
