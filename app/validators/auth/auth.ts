/* eslint-disable @typescript-eslint/naming-convention */
import env from '#start/env'
import { emailValidator, emailValidatorUnique } from '#validators/_shared'

import vine, { SimpleMessagesProvider } from '@vinejs/vine'

const bypass_captcha = env.get('BYPASS_CF_TURNSTILE')
const cf_token = bypass_captcha ? vine.string().minLength(1).optional() : vine.string().minLength(1)

export const authValidatorMessage = new SimpleMessagesProvider({
  'required': 'The {{ field }} field is required',
  'password.regex':
    'The {{ field }} field must have at least one uppercase, lowercase, digit, and special character',
  'password_confirmation.regex':
    'The {{ field }} field must have at least one uppercase, lowercase, digit, and special character',
  'cf_token.required': 'The captcha field is required',
})

export const registerValidator = vine.compile(
  vine.object({
    full_name: vine.string().minLength(3).maxLength(128),
    username: vine.string().minLength(1).maxLength(64),
    email: emailValidatorUnique,
    password: vine
      .string()
      .minLength(8)
      .maxLength(255)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,255}$/)
      .confirmed({ confirmationField: 'password_confirmation' }),
    cf_token,
  })
)

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
    password: vine
      .string()
      .minLength(8)
      .maxLength(255)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,255}$/),
    cf_token,
  })
)

export const askEmailVerifyValidator = vine.compile(
  vine.object({
    cf_token,
  })
)

export const askResetPasswordValidator = vine.compile(
  vine.object({
    email: emailValidator,
    cf_token,
  })
)

export const resetPasswordValidator = vine.compile(
  vine.object({
    email: emailValidator,
    password: vine
      .string()
      .minLength(8)
      .maxLength(255)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,255}$/)
      .confirmed({ confirmationField: 'password_confirmation' }),
    token: vine.string().minLength(1),
    cf_token,
  })
)
