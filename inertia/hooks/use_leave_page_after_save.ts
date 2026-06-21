import { useLocalStorage } from '@mantine/hooks'

const STORAGE_KEY = 'dashboard:leave-page-after-save'

export const useLeavePageAfterSave = (key: string) =>
  useLocalStorage<boolean>({
    key: STORAGE_KEY + ':' + key,
    defaultValue: true,
    getInitialValueInEffect: false,
  })
