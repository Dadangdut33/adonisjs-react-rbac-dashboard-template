import { Text, Title } from '@mantine/core'
import { ContextModalProps, modals } from '@mantine/modals'
import { JSX } from 'react'

export function BaseModal({
  text,
  title,
  onCancel,
  onConfirm,
  other,
}: {
  text: string | JSX.Element
  title?: string | JSX.Element
  onCancel?: () => void
  onConfirm?: () => void
  other?: Parameters<ContextModalProps['context']['openConfirmModal']>['0']
}) {
  const modal = () =>
    modals.openConfirmModal({
      title: title ?? (
        <Title component={'span'} order={3} ta={'center'} mx={'auto'}>
          Confirm Your Action
        </Title>
      ),
      centered: true,
      withCloseButton: false,
      children: <Text size="sm">{text}</Text>,
      labels: { confirm: 'Yes', cancel: 'No' },
      onCancel,
      onConfirm,
      ...other,
    })

  return modal
}

export function ConfirmModal({
  onCancel,
  onConfirm,
  message,
  title,
  w,
}: {
  onCancel?: () => void
  onConfirm?: () => void
  message: string | JSX.Element
  title?: string | JSX.Element
  w?: string
}) {
  return BaseModal({ title, text: message, onCancel, onConfirm, other: { w } })
}

export function ConfirmAddModal({
  onCancel,
  onConfirm,
  data,
}: {
  onCancel?: () => void
  onConfirm?: () => void
  data?: string
}) {
  return BaseModal({
    text: `Are you sure you want to save ${data || 'this data'}?`,
    onCancel,
    onConfirm,
  })
}

export function ConfirmCancelModal({
  onCancel,
  onConfirm,
  data,
}: {
  onCancel?: () => void
  onConfirm?: () => void
  data?: string
}) {
  return BaseModal({
    text: `Are you sure you want to cancel ${data || 'this action'}?`,
    onCancel,
    onConfirm,
  })
}

export function ConfirmResetModal({
  onCancel,
  onConfirm,
  data,
}: {
  onCancel?: () => void
  onConfirm?: () => void
  data?: string
}) {
  return BaseModal({
    text: `Are you sure you want to reset ${data || 'this data'}?`,
    onCancel,
    onConfirm,
  })
}

export function ConfirmDeleteModal({
  onCancel,
  onConfirm,
  data,
  extra,
}: {
  onCancel?: () => void
  onConfirm?: () => void
  data?: string
  extra?: string
}) {
  return BaseModal({
    text: `Are you sure you want to delete 🗑️ ${data || 'this data'}?${extra}`,
    onCancel,
    onConfirm,
    other: {
      confirmProps: { color: 'red' },
    },
  })
}

export function ConfirmLogoutModal({
  onCancel,
  onConfirm,
}: {
  onCancel?: () => void
  onConfirm: () => void
}) {
  return BaseModal({
    text: 'Are you sure you want to log out?',
    onCancel,
    onConfirm,
    other: {
      confirmProps: { color: 'red' },
    },
  })
}
