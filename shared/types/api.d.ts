import type { FormErrors } from '@mantine/form'

export interface TurnstileResponse {
  'success': boolean
  'challenge_ts': string
  'hostname': string
  'error-codes': string[]
  'action': string
  'cdata': string
  'metadata': {
    ephemeral_id: string
  }
}

export interface BaseAPIResponse<T = any> {
  status: 'success' | 'error'
  message: string
  data?: T
  redirect_to?: string
  form_errors?: FormErrors
  unique_error_uuid?: string
}
