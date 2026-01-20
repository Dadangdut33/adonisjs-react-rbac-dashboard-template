import { QueryBuilderParams, RequestError } from '#types/app'

import { Exception } from '@adonisjs/core/exceptions'
import { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import { randomInt, randomUUID } from 'node:crypto'

export function generateRandomPassword(length: number = 24): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'
  const allChars = lowercase + uppercase + numbers + symbols

  let password = ''
  // Ensure we have at least one of each required type
  password += lowercase[randomInt(0, lowercase.length)]
  password += uppercase[randomInt(0, uppercase.length)]
  password += numbers[randomInt(0, numbers.length)]
  password += symbols[randomInt(0, symbols.length)]

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[randomInt(0, allChars.length)]
  }

  // Shuffle the password
  return password
    .split('')
    .sort(() => 0.5 - Math.random())
    .join('')
}

export function mapRequestToQueryParams<T>(request: HttpContext['request']): QueryBuilderParams<T> {
  // sort direction is marked by if there is a "-" at the beginning of the sortBy
  let sortBy = request.input('sort', '')
  const sortDirection = sortBy.startsWith('-') ? 'desc' : 'asc'
  if (sortBy.startsWith('-')) sortBy = sortBy.replace('-', '')

  return {
    page: request.input('page', 1),
    perPage: request.input('per_page', 10),

    // global search (?search=john)
    search: request.input('search', ''),

    // column search (?searchBy[username]=john&searchBy[email]=gmail)
    searchBy: request.input('searchBy', {}),

    sortBy,
    sortDirection,
  }
}

export function parseRelationColumn(key: string) {
  const parts = key.split('.')
  if (parts.length === 2) {
    return { relation: parts[0], column: parts[1] }
  }
  return null
}

export function parseSelectPreload(items: string[] = []) {
  const map: Record<string, string[]> = {}

  for (const item of items) {
    const [path, cols] = item.split(':')
    if (!cols) continue

    const [relation] = path.split('.')
    map[relation] = cols.split(',').map((c) => c.trim())
  }

  return map
}

export function getMethodActName(request: HttpContext['request']) {
  const method = request.method()
  switch (method) {
    case 'GET':
      return 'fetched'
    case 'POST':
      return 'created'
    case 'PATCH':
      return 'updated'
    case 'DELETE':
      return 'deleted'
    default:
      return 'unknown'
  }
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

export function mapReadableErrors(err: RequestError | any) {
  if (err.code !== 'E_VALIDATION_ERROR')
    return err.messages?.[0]?.message || err.message || 'Something went wrong'

  const mappedErrors = mapReqErrors(err)
  return Object.entries(mappedErrors)
    .map(([_key, value]) => `- ${value}`)
    .join('\n')
}

export function returnError(
  response: HttpContext['response'],
  error: any,
  errorIdentifier: string,
  // By default we set logger to log errors, but dont log validation errors
  { logErrors = true, logValidation = false }: { logErrors?: boolean; logValidation?: boolean }
) {
  // eslint-disable-next-line
  let unique_error_id: string | undefined
  if (logErrors) {
    unique_error_id = randomUUID()
    // only log if it is not a validation error
    if (error.code !== 'E_VALIDATION_ERROR') logger.error(error, errorIdentifier + unique_error_id)
  }

  if (logValidation && error.code === 'E_VALIDATION_ERROR') {
    if (!unique_error_id) unique_error_id = randomUUID()
    logger.error(error, errorIdentifier + unique_error_id)
  }

  return response.status(error.status || 500).json({
    status: 'error',
    message: mapReadableErrors(error),
    form_errors: mapReqErrors(error),
    unique_error_id,
  })
}

export function throwForbidden(
  message = 'You are not allowed to perform this action',
  cause?: string
) {
  throw new Exception(message, {
    status: 403,
    cause,
  })
}

export function throwUnauthorized(
  message = 'You are not authorized to perform this action',
  cause?: string
) {
  throw new Exception(message, {
    status: 401,
    cause,
  })
}

export function throwNotFound(message = 'Page not found') {
  throw new Exception(message, {
    status: 404,
  })
}
