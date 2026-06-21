import type { PaginationMeta } from '#types/app'

import { Head } from '@inertiajs/react'
import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Group,
  JsonInput,
  Loader,
  Tooltip as MantineTooltip,
  Modal,
  Paper,
  Stack,
  Text,
  TextInput,
  Typography,
} from '@mantine/core'
import { DatePicker, type DatesRangeValue } from '@mantine/dates'
import { useDisclosure } from '@mantine/hooks'
import { IconAlertTriangle, IconEye, IconSearch, IconTrash } from '@tabler/icons-react'
import dayjs from 'dayjs'
import { ListRestart } from 'lucide-react'
import {
  DataTable,
  DataTableProps,
  DataTableSortStatus,
  useDataTableColumns,
} from 'mantine-datatable'
import { useState } from 'react'
import { LogMarkdown } from '~/components/core/log/log-markdown'
import { FilterDate } from '~/components/core/table-filter/date-filter'
import { FilterText } from '~/components/core/table-filter/text-filter'
import { TooltipIfTrue } from '~/components/core/tooltipper'
import classes from '~/css/TableUtils.module.css'
import { Data } from '~/generated/data'
import { useGenericMutation } from '~/hooks/use_generic_mutation'
import useSearchFilter from '~/hooks/use_search_filter'
import DashboardLayout from '~/layouts/dashboard'
import { urlFor } from '~/lib/client'
import { cn } from '~/lib/utils'
import { InertiaProps } from '~/types'

const baseRoute = 'activity_log'
const basePerm = 'activity_log'
const pageTitle = 'Activity Log'
type PageProps = InertiaProps<{
  data: Data.ActivityLog[]
  meta: PaginationMeta
  log_date_bounds: {
    oldest: string | null
    newest: string | null
  }
}>
type DataType = PageProps['data'][number]

export default function Page(props: PageProps) {
  const breadcrumbs = [
    {
      title: 'Dashboard',
      href: urlFor('dashboard.view'),
    },
    {
      title: pageTitle,
      href: props.currentPath,
    },
  ]

  // Data
  const { data, meta } = props
  const canDelete = props.user?.permissions.includes(`${basePerm}.delete`) ?? false
  const hasLogHistory = !!props.log_date_bounds.oldest && !!props.log_date_bounds.newest
  const clearLogsDisabledReason = !canDelete
    ? "You don't have permission to clear activity logs"
    : !hasLogHistory
      ? 'No activity logs available to clear'
      : ''

  // State
  const searchFilter = useSearchFilter(`${baseRoute}.index`)
  const [selectedMetadata, setSelectedMetadata] = useState<any>(null)
  const [metadataModalOpened, { open: openMetadataModal, close: closeMetadataModal }] =
    useDisclosure(false)
  const [clearModalOpened, { open: openClearModal, close: closeClearModal }] = useDisclosure(false)
  const [searching, setSearching] = useState(false)
  const [clearDateRange, setClearDateRange] = useState<DatesRangeValue<string>>([null, null])

  const handleSearchingButton = () => {
    setSearching((prev) => !prev)
  }

  const clearRangeMutation = useGenericMutation<{ start_date: string; end_date: string }>(
    'DELETE',
    urlFor('activity_log.clearRange'),
    {
      doRedirect: false,
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      onSuccess: () => {
        setClearDateRange([null, null])
        closeClearModal()
        searchFilter.doSearch(searchFilter.search)
      },
    }
  )

  const handleClearLogs = () => {
    if (!clearDateRange[0] || !clearDateRange[1]) return

    clearRangeMutation.mutate({
      start_date: dayjs(clearDateRange[0]).format('YYYY-MM-DD'),
      end_date: dayjs(clearDateRange[1]).format('YYYY-MM-DD'),
    })
  }

  const handleCloseClearModal = () => {
    setClearDateRange([null, null])
    closeClearModal()
  }

  // Columns
  const key = 'activity-log-table'
  const columns: DataTableProps<DataType>['columns'] = [
    {
      accessor: 'user.full_name',
      title: 'User',
      toggleable: true,
      sortable: true,
      width: 200,
      render: (record) => (
        <Stack gap={0}>
          <Text fz="sm" fw={600}>
            {record.user?.full_name || 'System'}
          </Text>
          <Text fz="xs" c="dimmed">
            {record.user?.email || ''}
          </Text>
          <Text fz="xs" c="dimmed">
            [{record.user?.id || ''}]
          </Text>
        </Stack>
      ),
      filter: () => (
        <FilterText
          column={'user.full_name'}
          searchFilter={searchFilter}
          label="User"
          description="Filter by user name"
        />
      ),
      filtering: searchFilter.searchBy['user.full_name'] ? true : false,
    },
    {
      accessor: 'action',
      title: 'Action',
      toggleable: true,
      sortable: true,
      width: 180,
      render: (record) => (
        <Badge color="gray" variant="outline">
          {record.action}
        </Badge>
      ),
      filter: () => (
        <FilterText
          column={'action'}
          searchFilter={searchFilter}
          label="Action"
          description="Filter by action name"
        />
      ),
      filtering: searchFilter.searchBy.action ? true : false,
    },
    {
      accessor: 'target',
      title: 'Target',
      toggleable: true,
      sortable: true,
      width: 350,
      render: (record) => {
        return (
          <Typography>
            <LogMarkdown markdown={record.target} />
          </Typography>
        )
      },
      filter: () => (
        <FilterText
          column={'target'}
          searchFilter={searchFilter}
          label="Target"
          description="Filter by target"
        />
      ),
      filtering: searchFilter.searchBy.target ? true : false,
    },
    {
      accessor: 'metadata',
      title: 'Metadata',
      width: 350,
      toggleable: true,
      sortable: true,
      render: (record) => (
        <Box pos={'relative'}>
          <ActionIcon
            pos={'absolute'}
            top={5}
            right={5}
            variant="light"
            className="z-50"
            onClick={() => {
              setSelectedMetadata(record.metadata)
              openMetadataModal()
            }}
          >
            <IconEye size={16} />
          </ActionIcon>

          <JsonInput value={JSON.stringify(record.metadata, null, 2)} rows={5} readOnly />
        </Box>
      ),
      filter: () => (
        <FilterText
          column={'metadata'}
          searchFilter={searchFilter}
          label="Metadata"
          description="Filter by metadata"
        />
      ),
      filtering: searchFilter.searchBy.metadata ? true : false,
    },
    {
      accessor: 'created_at',
      title: 'Timestamp',
      toggleable: true,
      sortable: true,
      width: 200,
      render: ({ created_at }) => (
        <MantineTooltip label={dayjs(created_at).format('YYYY-MM-DD HH:mm:ss')}>
          <Text fz="sm">{dayjs(created_at).format('YYYY-MM-DD HH:mm:ss')}</Text>
        </MantineTooltip>
      ),
      filter: () => (
        <FilterDate
          column={'created_at'}
          searchFilter={searchFilter}
          label="Created At"
          description="Filter by date"
        />
      ),
      filtering: searchFilter.searchBy.created_at ? true : false,
    },
  ]

  const { effectiveColumns, resetColumnsToggle, resetColumnsWidth, resetColumnsOrder } =
    useDataTableColumns({
      columns,
      key,
    })

  const thereIsHiddenColumn = effectiveColumns.some((col) => col.hidden)
  const resetColumnState = () => {
    resetColumnsToggle()
    resetColumnsWidth()
    resetColumnsOrder()
  }

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <Head title={pageTitle} />
      <div className="space-y-4">
        <Paper p="md" shadow="md" radius="md" withBorder>
          <Group justify="flex-end" mb="md">
            <Group gap={'xs'}>
              <TextInput
                placeholder="Search logs..."
                leftSection={
                  searchFilter.isFetching ? <Loader size={16} /> : <IconSearch size={16} />
                }
                value={searchFilter.search}
                onChange={(e) => searchFilter.onSearch(e.currentTarget.value)}
                className={cn(classes.searchInput, {
                  [classes.appearAnimation]: searching,
                  [classes.disappearAnimation]: !searching,
                })}
              />

              <MantineTooltip label="Search" withArrow>
                <ActionIcon
                  variant="outline"
                  size={'lg'}
                  onClick={handleSearchingButton}
                  loading={searchFilter.isFetching}
                >
                  <IconSearch />
                </ActionIcon>
              </MantineTooltip>
            </Group>

            <TooltipIfTrue isTrue={!!clearLogsDisabledReason} label={clearLogsDisabledReason}>
              <Button
                color="red"
                variant={!clearLogsDisabledReason ? 'filled' : 'light'}
                leftSection={<IconTrash size={16} />}
                onClick={openClearModal}
                disabled={!!clearLogsDisabledReason}
                loading={clearRangeMutation.isPending}
              >
                Clear by date range
              </Button>
            </TooltipIfTrue>

            <MantineTooltip label="Reset columns" withArrow>
              <ActionIcon
                variant="outline"
                color="gray"
                size={'lg'}
                onClick={resetColumnState}
                disabled={!thereIsHiddenColumn}
              >
                <ListRestart />
              </ActionIcon>
            </MantineTooltip>
          </Group>

          <DataTable
            minHeight={200}
            verticalSpacing="xs"
            horizontalSpacing={'xs'}
            striped
            highlightOnHover
            withColumnBorders
            verticalAlign="top"
            storeColumnsKey={key}
            columns={effectiveColumns}
            records={data}
            fetching={searchFilter.isFetching}
            totalRecords={meta.total}
            recordsPerPage={meta.per_page}
            page={meta.current_page}
            recordsPerPageOptions={[5, 10, 15, 20, 50, 100, 200, 500, 1000]}
            onPageChange={(page) => searchFilter.onPageChange(page)}
            onRecordsPerPageChange={(perPage) => searchFilter.onRecordsPerPage(perPage)}
            sortStatus={searchFilter.sortStatus as DataTableSortStatus<DataType>}
            onSortStatusChange={(sortStatus: DataTableSortStatus<DataType>) =>
              searchFilter.onSortStatus(sortStatus as DataTableSortStatus<any>)
            }
          />
        </Paper>
      </div>

      <Modal
        opened={metadataModalOpened}
        onClose={closeMetadataModal}
        title="Log Metadata"
        size="lg"
      >
        <JsonInput
          label="Metadata Info"
          value={JSON.stringify(selectedMetadata, null, 2)}
          rows={15}
          readOnly
        />
      </Modal>

      <Modal
        opened={clearModalOpened}
        onClose={() => {
          if (clearRangeMutation.isPending) return
          closeClearModal()
        }}
        title="Clear activity logs"
        size="md"
        centered
      >
        <Stack>
          <Alert
            color="red"
            variant="light"
            icon={<IconAlertTriangle size={16} />}
            title="Destructive action"
          >
            This will permanently delete activity logs created within the selected date range.
          </Alert>

          <DatePicker
            mx={'auto'}
            type="range"
            allowSingleDateInRange
            value={clearDateRange}
            onChange={(range) => setClearDateRange(range)}
            minDate={props.log_date_bounds.oldest ?? undefined}
            maxDate={props.log_date_bounds.newest ?? undefined}
          />

          <Text size="sm" c="dimmed">
            Selected range:{' '}
            {clearDateRange[0] && clearDateRange[1]
              ? `${dayjs(clearDateRange[0]).format('YYYY-MM-DD')} to ${dayjs(clearDateRange[1]).format('YYYY-MM-DD')}`
              : 'Choose a start and end date'}
          </Text>

          <Text size="sm" c="dimmed">
            Available logs:{' '}
            {hasLogHistory
              ? `${props.log_date_bounds.oldest} to ${props.log_date_bounds.newest}`
              : 'No activity logs found'}
          </Text>

          <Group justify="flex-end">
            <Button
              variant="default"
              onClick={handleCloseClearModal}
              disabled={clearRangeMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              color="red"
              onClick={handleClearLogs}
              loading={clearRangeMutation.isPending}
              disabled={!clearDateRange[0] || !clearDateRange[1]}
            >
              Delete logs
            </Button>
          </Group>
        </Stack>
      </Modal>
    </DashboardLayout>
  )
}
