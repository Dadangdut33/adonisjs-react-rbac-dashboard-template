import vine from '@vinejs/vine'

export const emailValidator = vine.string().email().normalizeEmail()

export const emailValidatorUnique = vine
  .string()
  .trim()
  .email()
  .normalizeEmail()
  .unique(async (query, value) => {
    const match = await query.from('users').select('id').where('email', value).first()
    return !match
  })
  .maxLength(255)
  .minLength(3)
