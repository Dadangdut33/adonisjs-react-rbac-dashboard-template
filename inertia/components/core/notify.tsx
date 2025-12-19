'use client'

import React from 'react'
import { ExternalToast, toast } from 'sonner'

export function NotifyError(
  title: string | React.ReactNode,
  message: string | React.ReactNode = '',
  others?: ExternalToast
) {
  return toast.error(title, {
    description: message,
    ...others,
  })
}

export function NotifySuccess(
  title: string,
  message: string | React.ReactNode = '',
  others?: ExternalToast
) {
  return toast.success(title, {
    description: message,
    ...others,
  })
}

export function NotifyInfo(
  title: string,
  message: string | React.ReactNode = '',
  others?: ExternalToast
) {
  return toast.info(title, {
    description: message,
    ...others,
  })
}

export function NotifyWarning(
  title: string,
  message: string | React.ReactNode = '',
  others?: ExternalToast
) {
  return toast.warning(title, {
    description: message,
    ...others,
  })
}
