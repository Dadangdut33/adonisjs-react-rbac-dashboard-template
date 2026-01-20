import { ActionIcon, CopyButton, PinInput } from '@mantine/core'
import { IconCheck, IconCopy } from '@tabler/icons-react'
import { ReactNode, createContext, useCallback, useContext, useEffect, useState } from 'react'
import { Button, btnVariant } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescriptionDiv,
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
  withCancel?: boolean
  width?: string
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void | Promise<void>
  pinConfirmation?: boolean
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
  const [randomPin, setRandomPin] = useState<string>('')
  const [inputPin, setInputPin] = useState<string>('')

  useEffect(() => {
    if (modal.pinConfirmation) {
      setRandomPin(Math.floor(10000000 + Math.random() * 90000000).toString())
      setInputPin('')
    }
  }, [modal.id, modal.pinConfirmation])

  const isPinValid = !modal.pinConfirmation || inputPin === randomPin

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
        <DialogDescriptionDiv className="whitespace-pre-wrap">
          <div className="flex flex-col gap-4">
            <div>{modal.message}</div>
            {modal.pinConfirmation && (
              <div className="flex flex-col items-center gap-2">
                <div className="text-sm font-medium">
                  Please enter this PIN to confirm:{' '}
                  <span className="font-bold">
                    {randomPin.slice(0, 4) + '-' + randomPin.slice(4)}
                  </span>
                  <CopyButton value={randomPin}>
                    {({ copied, copy }) => (
                      <ActionIcon
                        ms={1}
                        variant="subtle"
                        color={copied ? 'teal' : 'gray'}
                        onClick={copy}
                        size={'xs'}
                      >
                        {copied ? <IconCheck size={13} /> : <IconCopy size={13} />}
                      </ActionIcon>
                    )}
                  </CopyButton>
                </div>
                <PinInput length={8} type="number" value={inputPin} onChange={setInputPin} />
              </div>
            )}
          </div>
        </DialogDescriptionDiv>
        <DialogFooter>
          {modal.withCancel && (
            <Button
              variant={modal.cancelVariant || 'default'}
              onClick={handleCancel}
              disabled={modal.cancelVariant === 'disabled'}
              className={modal.cancelClassName}
            >
              {modal.cancelText || 'No'}
            </Button>
          )}
          <Button
            variant={modal.confirmVariant}
            onClick={handleConfirm}
            disabled={!isPinValid || modal.confirmVariant === 'disabled'}
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
      withCancel?: boolean
      pinConfirmation?: boolean
    }) => {
      return () => openModal({ ...config, withCancel: config.withCancel ?? true })
    },
    [openModal]
  )
}
