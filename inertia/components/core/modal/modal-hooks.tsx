import { Check, RefreshCcwIcon, Trash2, UserX, X } from 'lucide-react'
import { btnVariant } from '~/components/ui/button'

import { useConfirmModal } from './modal-context'

// Hook that provides the same API as the original modals but uses the context
export function useModals() {
  const confirmModal = useConfirmModal()

  return {
    ConfirmModal: (config: {
      message: string | React.ReactNode
      title?: string | React.ReactNode
      onConfirm?: () => void | Promise<void>
      onCancel?: () => void | Promise<void>
      confirmText?: string
      cancelText?: string
      confirmVariant?: btnVariant
      cancelVariant?: btnVariant
      width?: string
    }) => {
      return confirmModal(config)
    },

    ConfirmAddModal: (config: {
      title?: string | React.ReactNode
      name?: string
      message?: string | React.ReactNode
      onConfirm?: () => void | Promise<void>
      onCancel?: () => void | Promise<void>
      confirmText?: string
      cancelText?: string
      confirmVariant?: btnVariant
      cancelVariant?: btnVariant
    }) => {
      return confirmModal({
        title: config.title || (
          <div className="flex items-center gap-2">
            <Check className="size-5 text-green-600" />
            <span>Save {config.name || 'Data'}</span>
          </div>
        ),
        message: config.message || `Are you sure you want to save ${config.name || 'this data'}?`,
        onConfirm: config.onConfirm,
        onCancel: config.onCancel,
        confirmText: config.confirmText || 'Save',
        cancelText: config.cancelText || 'Cancel',
        confirmVariant: 'green',
        cancelVariant: 'destructive',
      })
    },

    ConfirmCancelModal: (config: {
      title?: string | React.ReactNode
      name?: string
      message?: string | React.ReactNode
      onConfirm?: () => void | Promise<void>
      onCancel?: () => void | Promise<void>
      confirmText?: string
      cancelText?: string
      confirmVariant?: btnVariant
      cancelVariant?: btnVariant
    }) => {
      return confirmModal({
        title: config.title || (
          <div className="flex items-center gap-2">
            <X className="size-5 text-yellow-600" />
            <span>Cancel {config.name || 'Action'}</span>
          </div>
        ),
        message:
          config.message || `Are you sure you want to cancel ${config.name || 'this action'}?`,
        onConfirm: config.onConfirm,
        onCancel: config.onCancel,
        confirmText: config.confirmText || 'Cancel',
        cancelText: config.cancelText || 'Keep',
        confirmVariant: config.confirmVariant,
        cancelVariant: config.cancelVariant,
      })
    },

    ConfirmResetModal: (config: {
      title?: string | React.ReactNode
      name?: string
      message?: string | React.ReactNode
      onConfirm?: () => void | Promise<void>
      onCancel?: () => void | Promise<void>
      confirmText?: string
      cancelText?: string
      confirmVariant?: btnVariant
      cancelVariant?: btnVariant
    }) => {
      return confirmModal({
        title: config.title || (
          <div className="flex items-center gap-2">
            <RefreshCcwIcon className="size-5 text-blue-600" />
            <span>Reset {config.name || 'Data'}</span>
          </div>
        ),
        message: config.message || `Are you sure you want to reset ${config.name || 'this data'}?`,
        onConfirm: config.onConfirm,
        onCancel: config.onCancel,
        confirmText: config.confirmText || 'Reset',
        cancelText: config.cancelText || 'Cancel',
        confirmVariant: 'destructive',
        cancelVariant: config.cancelVariant,
      })
    },

    ConfirmDeleteModal: (config: {
      title?: string | React.ReactNode
      name?: string
      message?: string | React.ReactNode
      extra?: string
      onConfirm?: () => void | Promise<void>
      onCancel?: () => void | Promise<void>
      confirmText?: string
      cancelText?: string
      confirmVariant?: btnVariant
      cancelVariant?: btnVariant
    }) => {
      return confirmModal({
        title: config.title || (
          <div className="flex items-center gap-2">
            <Trash2 className="size-5 text-red-400" />
            <span>Delete {config.name || 'Data'}</span>
          </div>
        ),
        message:
          config.message ||
          `Are you sure you want to delete 🗑️ ${config.name || 'this data'}?${config.extra || ''}`,
        onConfirm: config.onConfirm,
        onCancel: config.onCancel,
        confirmText: config.confirmText || 'Delete',
        cancelText: config.cancelText || 'Cancel',
        confirmVariant: config.confirmVariant,
        cancelVariant: config.cancelVariant,
        confirmClassName: 'bg-red-500 hover:bg-red-600 text-white',
      })
    },

    ConfirmLogoutModal: (config: {
      onConfirm: () => void | Promise<void>
      onCancel?: () => void | Promise<void>
      confirmText?: string
      cancelText?: string
      confirmVariant?: btnVariant
      cancelVariant?: btnVariant
    }) => {
      return confirmModal({
        title: (
          <div className="flex items-center gap-2">
            <UserX className="size-5 text-red-400" />
            <span>Logout</span>
          </div>
        ),
        message: 'Are you sure you want to log out?',
        onConfirm: config.onConfirm,
        onCancel: config.onCancel,
        confirmText: config.confirmText || 'Logout',
        cancelText: config.cancelText || 'Stay',
        confirmVariant: config.confirmVariant,
        cancelVariant: config.cancelVariant,
        confirmClassName: 'bg-red-500 hover:bg-red-600 text-white',
      })
    },
  }
}
