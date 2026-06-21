import { Button, Group } from '@mantine/core'
import { IconArrowLeft, IconCancel, IconDeviceFloppy } from '@tabler/icons-react'
import type { ReactNode } from 'react'

type DashboardFormActionBarProps = {
  onBack: () => void
  backLoading?: boolean
  backDisabled?: boolean
  backLabel?: string
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
  secondaryActionLoading?: boolean
  secondaryActionDisabled?: boolean
  secondaryActionColor?: string
  secondaryActionVariant?: 'filled' | 'light' | 'outline' | 'subtle' | 'default'
  primaryActionLabel?: string
  onPrimaryAction?: () => void
  primaryActionLoading?: boolean
  primaryActionDisabled?: boolean
  beforeSecondaryActions?: ReactNode
  afterPrimaryActions?: ReactNode
  afterBackAction?: ReactNode
}

export default function DashboardFormActionBar({
  onBack,
  backLoading = false,
  backDisabled = false,
  backLabel = 'Back',
  secondaryActionLabel,
  onSecondaryAction,
  secondaryActionLoading = false,
  secondaryActionDisabled = false,
  secondaryActionColor = 'red',
  secondaryActionVariant = 'outline',
  primaryActionLabel,
  onPrimaryAction,
  primaryActionLoading = false,
  primaryActionDisabled = false,
  beforeSecondaryActions,
  afterPrimaryActions,
  afterBackAction,
}: DashboardFormActionBarProps) {
  const showSecondaryAction = !!secondaryActionLabel && !!onSecondaryAction
  const showPrimaryAction = !!primaryActionLabel && !!onPrimaryAction

  return (
    <Group>
      <Button
        variant="outline"
        style={{ width: 'fit-content' }}
        loading={backLoading}
        disabled={backDisabled}
        leftSection={<IconArrowLeft size={16} />}
        color="gray"
        onClick={onBack}
      >
        {backLabel}
      </Button>

      {afterBackAction}

      <Group ms="auto" justify="flex-end">
        {beforeSecondaryActions}

        {showSecondaryAction && (
          <Button
            variant={secondaryActionVariant}
            style={{ width: 'fit-content' }}
            loading={secondaryActionLoading}
            disabled={secondaryActionDisabled}
            leftSection={<IconCancel size={16} />}
            color={secondaryActionColor}
            onClick={onSecondaryAction}
          >
            {secondaryActionLabel}
          </Button>
        )}

        {showPrimaryAction && (
          <Button
            style={{ width: 'fit-content' }}
            loading={primaryActionLoading}
            disabled={primaryActionDisabled}
            leftSection={<IconDeviceFloppy size={16} />}
            onClick={onPrimaryAction}
          >
            {primaryActionLabel}
          </Button>
        )}

        {afterPrimaryActions}
      </Group>
    </Group>
  )
}
