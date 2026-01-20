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

export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,255}$/

export const transformFullName = (value: string) => {
  return value.trim().replace(/\s+/g, ' ')
}

export const transformUsername = (value: string) => {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^\p{L}\p{M}.'\-() ]/gu, '')
}
