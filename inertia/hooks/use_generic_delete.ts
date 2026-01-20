import { BaseAPIResponse } from '#types/api'
import { RouteNameType } from '#types/app'

import { route } from '@izzyjs/route/client'
import { UseMutationOptions } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import React, { useEffect } from 'react'
import { useModals } from '~/components/core/modal/modal-hooks'

import { useGenericMutation } from './use_generic_mutation'

type Props<TData = any, TResponse extends BaseAPIResponse = BaseAPIResponse> = {
  isOpen: boolean
  data?: TData
  onClose: () => void
  onSuccess?: UseMutationOptions<TResponse, AxiosError<TResponse>, TData>['onSuccess']
  onError?: UseMutationOptions<TResponse, AxiosError<TResponse>, TData>['onError']
  title?: string | React.ReactNode
  name?: string
  message?: string | React.ReactNode
  extra?: string
  enablePin?: boolean
  routeName: RouteNameType
  deleteParam: {
    params: Record<string, any>
    qs?: Record<string, any>
    prefix?: string
    hash?: string
  }
}

export function useDeleteGeneric<T>({
  data,
  isOpen,
  name,
  title,
  message,
  extra,
  enablePin,
  onSuccess,
  onClose,
  onError,
  routeName,
  deleteParam,
}: Props<T>) {
  const { ConfirmDeleteModal } = useModals()

  const deleteMutation = useGenericMutation(
    'DELETE',
    route(routeName as any, deleteParam as any).path,
    {
      onSuccess: (dataRes, variables, onMutateResult, context) => {
        onSuccess && onSuccess(dataRes, variables, onMutateResult, context)
        onClose()
      },
      onError(error, variables, onMutateResult, context) {
        onError && onError(error, variables, onMutateResult, context)
        onClose()
      },
    }
  )

  const confirmModal = ConfirmDeleteModal({
    name,
    title,
    message,
    extra,
    enablePin: enablePin ?? true, // default  to true
    onConfirm: () => {
      deleteMutation.mutate(data)
    },
    onCancel: () => {
      onClose()
    },
  })

  useEffect(() => {
    if (isOpen) confirmModal()
    else onClose()
  }, [isOpen])

  return {
    confirmModal,
    deleteMutation,
  }
}
