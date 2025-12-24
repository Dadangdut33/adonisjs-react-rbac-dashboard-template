import { QueryBuilderParams, RequestError } from '#types/app'

import { Exception } from '@adonisjs/core/exceptions'
import { HttpContext } from '@adonisjs/core/http'

export function mapRequestToQueryParams<T>(request: HttpContext['request']): QueryBuilderParams<T> {
  return {
    page: request.input('page', 1),
    perPage: request.input('perPage', 10),

    // global search (?search=john)
    search: request.input('search', ''),

    // column search (?searchBy[username]=john&searchBy[email]=gmail)
    searchBy: request.input('searchBy', {}),

    sortBy: request.input('sortBy'),
    sortDirection: request.input('sortDirection', 'asc'),
  }
}

export function parseRelationColumn(key: string) {
  const parts = key.split('.')
  if (parts.length === 2) {
    return { relation: parts[0], column: parts[1] }
  }
  return null
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

export function reqErrorsToString(err: RequestError) {
  if (err.code !== 'E_VALIDATION_ERROR') return ''

  const mappedErrors = mapReqErrors(err)
  return Object.entries(mappedErrors)
    .map(([_key, value]) => `- ${value}`)
    .join('\n')
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
