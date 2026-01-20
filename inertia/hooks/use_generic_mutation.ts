import { BaseAPIResponse } from '#types/api'

import { router } from '@inertiajs/react'
import { UseMutationOptions, UseMutationResult, useMutation } from '@tanstack/react-query'
import { AxiosError, AxiosHeaders, Method, RawAxiosRequestHeaders } from 'axios'
import { NotifyError, NotifySuccess } from '~/components/core/notify'
import { api } from '~/lib/axios'

export function useGenericMutation<
  TData = any,
  TResponse extends BaseAPIResponse = BaseAPIResponse,
>(
  method: Method,
  url: string,
  options?: UseMutationOptions<TResponse, AxiosError<TResponse>, TData> & {
    doRedirect?: boolean
    headers?: RawAxiosRequestHeaders | AxiosHeaders
    notifySuccess?: boolean
    notifyError?: boolean
  }
): UseMutationResult<TResponse, AxiosError<TResponse>, TData> {
  const {
    onSuccess,
    onError,
    doRedirect = true,
    headers = {
      'Content-Type': 'multipart/form-data',
      'X-Requested-With': 'XMLHttpRequest',
    },
    notifySuccess = true,
    notifyError = true,
    ...rest
  } = options ?? {}

  // Track if onError has already fired
  let errorHandled = false

  return useMutation({
    ...rest,

    mutationFn: async (data: TData): Promise<TResponse> => {
      const res = await api.request<TResponse>({
        method,
        url,
        data,
        headers,
      })

      return res.data
    },

    onSuccess: (res, variables, results, context) => {
      if (res.status === 'success') {
        notifySuccess && NotifySuccess('Success', res.message)
      } else {
        console.error(res)
        notifyError && NotifyError('Error', res.message)
      }

      onSuccess?.(res, variables, results, context)
      if (doRedirect && res.status === 'success' && res.redirect_to) router.visit(res.redirect_to)
    },

    onError: (error, variables, results, context) => {
      errorHandled = true // mark as handled

      console.error(error)
      notifyError && NotifyError('Error', error.response?.data.message || error.message)
      onError?.(error, variables, results, context)
    },

    onSettled(_data, error, variables, results, context) {
      // Run fallback only if an error exists AND onError didn't handle it
      if (error && !errorHandled) {
        console.error(error)
        notifyError && NotifyError('Error', error.response?.data.message || error.message)
        onError?.(error, variables, results, context)
      }

      // reset for next mutation
      errorHandled = false
    },
  })
}
