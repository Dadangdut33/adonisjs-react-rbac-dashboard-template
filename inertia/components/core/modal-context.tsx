import { ReactNode, createContext, useCallback, useContext, useState } from 'react'
import { Button, btnVariant } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'

interface ModalConfig {
  id: string
  title?: string | React.ReactNode
  message: string | React.ReactNode
  confirmText?: string
  cancelText?: string
  confirmVariant?: btnVariant
  confirmClassName?: string
  cancelVariant?: btnVariant
  cancelClassName?: string
  width?: string
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void | Promise<void>
}

interface ModalContextType {
  openModal: (config: Omit<ModalConfig, 'id'>) => string
  closeModal: (id: string) => void
  closeAllModals: () => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modals, setModals] = useState<ModalConfig[]>([])

  const openModal = useCallback((config: Omit<ModalConfig, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const modal: ModalConfig = { ...config, id }

    setModals((prev) => [...prev, modal])
    return id
  }, [])

  const closeModal = useCallback((id: string) => {
    setModals((prev) => prev.filter((modal) => modal.id !== id))
  }, [])

  const closeAllModals = useCallback(() => {
    setModals([])
  }, [])

  return (
    <ModalContext.Provider value={{ openModal, closeModal, closeAllModals }}>
      {children}
      <ModalRenderer modals={modals} onClose={closeModal} />
    </ModalContext.Provider>
  )
}

function ModalRenderer({
  modals,
  onClose,
}: {
  modals: ModalConfig[]
  onClose: (id: string) => void
}) {
  if (modals.length === 0) return null

  const modal = modals[modals.length - 1] // Show only the topmost modal

  const handleConfirm = async () => {
    if (modal.confirmVariant === 'disabled') return
    try {
      await modal.onConfirm?.()
    } finally {
      onClose(modal.id)
    }
  }

  const handleCancel = async () => {
    if (modal.cancelVariant === 'disabled') return
    try {
      await modal.onCancel?.()
    } finally {
      onClose(modal.id)
    }
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose(modal.id)}>
      <DialogContent style={modal.width ? { maxWidth: modal.width } : undefined}>
        <DialogHeader>
          <DialogTitle>
            {modal.title ?? (
              <span className="text-lg font-heading leading-none tracking-tight text-center">
                Confirm Your Action
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="whitespace-pre-wrap">{modal.message}</DialogDescription>
        <DialogFooter>
          <Button
            variant={modal.cancelVariant || 'default'}
            onClick={handleCancel}
            disabled={modal.cancelVariant === 'disabled'}
            className={modal.cancelClassName}
          >
            {modal.cancelText || 'No'}
          </Button>
          <Button
            variant={modal.confirmVariant}
            onClick={handleConfirm}
            disabled={modal.confirmVariant === 'disabled'}
            className={modal.confirmClassName}
          >
            {modal.confirmText || 'Yes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function useModal() {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}

// Convenience hook for creating modal functions similar to the original API
export function useConfirmModal() {
  const { openModal } = useModal()

  return useCallback(
    (config: {
      message: string | React.ReactNode
      title?: string | React.ReactNode
      onConfirm?: () => void | Promise<void>
      onCancel?: () => void | Promise<void>
      confirmText?: string
      cancelText?: string
      confirmVariant?: btnVariant
      cancelVariant?: btnVariant
      confirmClassName?: string
      cancelClassName?: string
      width?: string
    }) => {
      return () => openModal(config)
    },
    [openModal]
  )
}
