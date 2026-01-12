import { type RequestError } from '#types/app'

import { FormErrors, UseFormReturnType } from '@mantine/form'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { NotifyError } from '~/components/core/notify'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isProd() {
  return import.meta.env.PROD
}

export function mapReqErrors(err: RequestError) {
  // first need to make sure that it is indeed a form error
  if (err.code !== 'E_VALIDATION_ERROR') return {}

  const mappedErrors: Record<string, string> = {}

  err.messages.forEach((error) => {
    mappedErrors[error.field] = error.message
  })

  return mappedErrors
}

export function reqErrorsToString(err: RequestError) {
  const mappedErrors = mapReqErrors(err)
  return Object.entries(mappedErrors)
    .map(([_key, value]) => `${value}`)
    .join(', ')
}

export function formErrorsToString(err: FormErrors) {
  return Object.entries(err)
    .map(([_key, value]) => `- ${value}`)
    .join('\n')
}

// For checking form.
// If there are errors, we notify the user and return false
// If there are no errors, we return true
// A simple captcha check is done if bypass_captcha is true
export function checkFormWithCaptcha<
  TValues extends Record<string, unknown> = Record<string, unknown>,
>(
  form: UseFormReturnType<TValues>,
  { bypass_captcha }: { bypass_captcha?: boolean } = { bypass_captcha: false }
) {
  const { hasErrors, errors } = form.validate()
  if (hasErrors) {
    // if we bypass captcha check we want to allow the form to submit so We:
    // check if the errors is only 1 error and its captcha error and bypass_captcha is true
    if (bypass_captcha && Object.keys(errors).length === 1 && errors.cf_token) {
      console.log('Captcha bypassed because bypass_captcha is true')
      return true
    }
    // else we notify the user and return false
    NotifyError('Error in form', formErrorsToString(errors))
  }
  return !hasErrors // we return true if there are no errors
}

export function checkForm<TValues extends Record<string, unknown> = Record<string, unknown>>(
  form: UseFormReturnType<TValues>
) {
  const { hasErrors, errors } = form.validate()
  if (hasErrors) {
    // else we notify the user and return false
    NotifyError('Error in form', formErrorsToString(errors))
  }
  return !hasErrors // we return true if there are no errors
}

export function limitString(str: string, limit: number) {
  if (str.length > limit) {
    return str.slice(0, limit) + '...'
  }
  return str
}

export function getInitials(name: string) {
  const [firstName, lastName] = name.split(' ')

  const firstInitial = firstName ? firstName.charAt(0) : ''
  const lastInitial = lastName ? lastName.charAt(0) : ''

  if (firstInitial && lastInitial) {
    return `${firstInitial}${lastInitial}`
  }

  return firstInitial || lastInitial || ''
}
