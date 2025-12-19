import { Button } from '~/components/ui/button'

import { useModals } from './modal-hooks'

/**
 * Test component to demonstrate the new modal provider system
 * This shows how modals can be used without adding ModalComponent to JSX
 */
export function ModalProviderTest() {
  const { ConfirmModal, ConfirmAddModal, ConfirmDeleteModal, ConfirmLogoutModal } = useModals()

  const basicConfirm = ConfirmModal({
    message: 'This modal is managed by the provider - no ModalComponent needed in JSX!',
    title: 'Provider Modal Test',
    onConfirm: () => {
      console.log('Basic confirm clicked')
    },
    onCancel: () => {
      console.log('Basic cancel clicked')
    },
  })

  const addModal = ConfirmAddModal({
    data: 'test data',
    onConfirm: () => {
      console.log('Add confirmed')
    },
    onCancel: () => {
      console.log('Add cancelled')
    },
  })

  const deleteModal = ConfirmDeleteModal({
    data: 'this item',
    extra: ' This action cannot be undone.',
    onConfirm: () => {
      console.log('Delete confirmed')
    },
    onCancel: () => {
      console.log('Delete cancelled')
    },
  })

  const logoutModal = ConfirmLogoutModal({
    onConfirm: () => {
      console.log('Logout confirmed')
    },
    onCancel: () => {
      console.log('Logout cancelled')
    },
  })

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Modal Provider Test</h3>
      <p className="text-sm text-muted-foreground">
        These modals are managed by the ModalProvider - no need to add ModalComponent to your JSX!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Button onClick={basicConfirm}>Test Basic Confirm</Button>
        <Button onClick={addModal}>Test Add Modal</Button>
        <Button onClick={deleteModal}>Test Delete Modal</Button>
        <Button onClick={logoutModal}>Test Logout Modal aa</Button>
      </div>
    </div>
  )
}
