import { Link } from '@adonisjs/inertia/react'
import { ActionIcon, Button, Group, Tooltip as MantineTooltip, Paper } from '@mantine/core'
import { IconPlus, IconSearch, IconSearchOff, IconTrash } from '@tabler/icons-react'
import { ListRestart } from 'lucide-react'
import { TooltipIfTrue } from '~/components/core/tooltipper'

export type DashboardTableButtonsProps<TSelected> = {
  searching: boolean
  selectedRecords: TSelected[]
  canResetSearch?: boolean
  canDelete?: boolean
  canBulkDelete?: boolean
  canAdd?: boolean
  showAddButton?: boolean
  minBulkDelete?: number
  addHref?: string
  onToggleSearch: () => void
  onBulkDelete: () => void
  onResetFilter: () => void
  onResetColumns: () => void
  onAddClick?: () => void
  labels?: {
    search?: string
    delete?: string
    resetFilter?: string
    resetColumns?: string
    add?: string
    noDeletePermission?: string
    bulkDeleteMin?: string
    noAddPermission?: string
  }
}

export function DashboardTableButtons<TSelected>({
  searching,
  selectedRecords,
  canResetSearch = true,
  canDelete = true,
  canBulkDelete,
  canAdd = true,
  showAddButton = true,
  minBulkDelete = 1,
  addHref,
  onToggleSearch,
  onBulkDelete,
  onResetFilter,
  onResetColumns,
  onAddClick,
  labels,
}: DashboardTableButtonsProps<TSelected>) {
  const hasMinimumSelected = selectedRecords.length >= minBulkDelete
  const bulkDeleteAllowedBySelection = canBulkDelete ?? hasMinimumSelected
  const canBulkDeleteAction = canDelete && bulkDeleteAllowedBySelection

  const bulkDeleteDisabledLabel = !canDelete
    ? (labels?.noDeletePermission ?? "You don't have permission to delete")
    : (labels?.bulkDeleteMin ?? `Select at least ${minBulkDelete} records to delete`)

  const addButton = (
    <Button
      ms={'auto'}
      style={{ width: 'fit-content' }}
      variant="filled"
      disabled={!canAdd}
      leftSection={<IconPlus size={16} />}
      onClick={onAddClick}
      {...(canAdd && addHref ? ({ component: Link, href: addHref } as const) : {})}
    >
      {labels?.add ?? 'Add'}
    </Button>
  )

  return (
    <Paper withBorder radius="md" p="xs">
      <Group justify="space-between" align="center" gap="sm" wrap="wrap">
        <Group gap="xs" wrap="wrap">
          <MantineTooltip
            label={searching ? `Hide ${labels?.search ?? 'Search'}` : (labels?.search ?? 'Search')}
            withArrow
          >
            <ActionIcon
              variant={searching ? 'filled' : 'outline'}
              color={searching ? 'blue' : 'gray'}
              size="lg"
              onClick={onToggleSearch}
              aria-label={labels?.search ?? 'Search'}
            >
              <IconSearch size={16} />
            </ActionIcon>
          </MantineTooltip>

          <MantineTooltip label={'Reset Search'} withArrow>
            <ActionIcon
              variant={'outline'}
              color={'yellow'}
              size="lg"
              onClick={onResetFilter}
              disabled={!canResetSearch}
              aria-label={labels?.resetFilter ?? 'Reset Search'}
            >
              <IconSearchOff size={16} />
            </ActionIcon>
          </MantineTooltip>

          <MantineTooltip label="Reset column visibility, size, and order" withArrow>
            <ActionIcon
              variant="light"
              color="orange"
              size="lg"
              onClick={onResetColumns}
              aria-label={labels?.resetColumns ?? 'Reset Columns'}
            >
              <ListRestart />
            </ActionIcon>
          </MantineTooltip>

          <TooltipIfTrue isTrue={!canBulkDeleteAction} label={bulkDeleteDisabledLabel}>
            <Button
              color="red"
              style={{ width: 'fit-content' }}
              variant={canBulkDeleteAction ? 'filled' : 'light'}
              leftSection={<IconTrash size={16} />}
              disabled={!canBulkDeleteAction}
              onClick={onBulkDelete}
            >
              {(labels?.delete ?? 'Delete') + ` (${selectedRecords.length})`}
            </Button>
          </TooltipIfTrue>
        </Group>

        {showAddButton && (
          <TooltipIfTrue
            isTrue={!canAdd}
            label={labels?.noAddPermission ?? "You don't have permission to add"}
          >
            {addButton}
          </TooltipIfTrue>
        )}
      </Group>
    </Paper>
  )
}
