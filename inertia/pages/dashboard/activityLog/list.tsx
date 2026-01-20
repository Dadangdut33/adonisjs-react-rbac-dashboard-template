import ActivityLogController from '#controllers/activity_log.controller'
import { RouteNameType } from '#types/app'

import { InferPageProps, SharedProps } from '@adonisjs/inertia/types'
import { Head } from '@inertiajs/react'
import { route } from '@izzyjs/route/client'
import {
  ActionIcon,
  Badge,
  Box,
  Group,
  JsonInput,
  Loader,
  Tooltip as MantineTooltip,
  Modal,
  Paper,
  Stack,
  Text,
  TextInput,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconEye, IconSearch } from '@tabler/icons-react'
import dayjs from 'dayjs'
import { ListRestart } from 'lucide-react'
import {
  DataTable,
  DataTableProps,
  DataTableSortStatus,
  useDataTableColumns,
} from 'mantine-datatable'
import { useState } from 'react'
import { FilterDate } from '~/components/core/table-filter/date-filter'
import { FilterText } from '~/components/core/table-filter/text-filter'
import { SimpleMarkdown } from '~/components/ui/simple-markdown'
import classes from '~/css/TableUtils.module.css'
import useSearchFilter from '~/hooks/use_search_filter'
import DashboardLayout from '~/layouts/dashboard'
import { cn } from '~/lib/utils'

const baseRoute = 'activity_log'
const pageTitle = 'Activity Log'
type PageProps = SharedProps & InferPageProps<ActivityLogController, 'viewList'>
type DataType = PageProps['data'][number]

export default function page(props: PageProps) {
  const breadcrumbs = [
    {
      title: 'Dashboard',
      href: route('dashboard.view').path,
    },
    {
      title: pageTitle,
      href: props.currentPath,
    },
  ]

  // Data
  const { data, meta } = props

  // State
  const searchFilter = useSearchFilter(`${baseRoute}.index` as RouteNameType)
  const [selectedMetadata, setSelectedMetadata] = useState<any>(null)
  const [metadataModalOpened, { open: openMetadataModal, close: closeMetadataModal }] =
    useDisclosure(false)
  const [searching, setSearching] = useState(false)

  const handleSearchingButton = () => {
    setSearching((prev) => !prev)
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
        return <SimpleMarkdown markdown={record.target} className="log-table" />
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
            onSortStatusChange={(sortStatus) => searchFilter.onSortStatus(sortStatus as any)}
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
    </DashboardLayout>
  )
}
