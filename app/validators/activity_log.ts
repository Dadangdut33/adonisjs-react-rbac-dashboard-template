import vine from '@vinejs/vine'

export const clearActivityLogRangeValidator = vine.create(
  vine.object({
    start_date: vine
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/),
    end_date: vine
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/),
  })
)
