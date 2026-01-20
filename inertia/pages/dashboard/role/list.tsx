import RoleController from '#controllers/role.controller'
import { RouteNameType } from '#types/app'

import { InferPageProps, SharedProps } from '@adonisjs/inertia/types'
import { Head, Link } from '@inertiajs/react'
import { route } from '@izzyjs/route/client'
import {
  ActionIcon,
  Alert,
  Button,
  Group,
  Loader,
  Tooltip as MantineTooltip,
  Menu,
  Paper,
  Text,
  TextInput,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  IconAlertCircle,
  IconCheck,
  IconDotsVertical,
  IconEdit,
  IconPlus,
  IconSearch,
  IconTrash,
  IconX,
} from '@tabler/icons-react'
import dayjs from 'dayjs'
import { ListRestart, Trash2 } from 'lucide-react'
import {
  DataTable,
  DataTableProps,
  DataTableSortStatus,
  useDataTableColumns,
} from 'mantine-datatable'
import { useState } from 'react'
import { GenericBulkDeleteDescription, GenericDeleteTitle } from '~/components/core/delete-helper'
import { FilterDate } from '~/components/core/table-filter/date-filter'
import { FilterRadio } from '~/components/core/table-filter/radio-filter'
import { FilterText } from '~/components/core/table-filter/text-filter'
import { TooltipIfTrue } from '~/components/core/tooltipper'
import classes from '~/css/TableUtils.module.css'
import { useDeleteGeneric } from '~/hooks/use_generic_delete'
import useSearchFilter from '~/hooks/use_search_filter'
import DashboardLayout from '~/layouts/dashboard'
import { cn } from '~/lib/utils'

const baseRoute = 'role'
const basePerm = 'role'
const pageTitle = 'Role'
type PageProps = SharedProps & InferPageProps<RoleController, 'viewList'>
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

  const canAdd = props.user?.permissions.includes(`${basePerm}.create`)
  const canEdit = props.user?.permissions.includes(`${basePerm}.update`)
  const canDelete = props.user?.permissions.includes(`${basePerm}.delete`)

  // State
  const searchFilter = useSearchFilter(`${baseRoute}.index` as RouteNameType)
  const [selected, setSelected] = useState<DataType>()
  const [selectedRecords, setSelectedRecords] = useState<DataType[]>([])
  const [isOpen, { open: onOpen, close: onClose }] = useDisclosure(false)
  const [searching, setSearching] = useState(false)
  const handleSearchingButton = () => {
    setSearching((prev) => {
      return !prev
    })
  }

  // Single Delete
  useDeleteGeneric({
    isOpen,
    onClose,
    data: selected,
    onSuccess: () => {
      // making sure to filter selectedrecords item
      const deleted = selected
      setSelectedRecords((prev) => {
        return prev.filter((r) => r.id !== deleted?.id)
      })
      setSelected(undefined)
      onClose()
      searchFilter.doSearch()
    },
    deleteParam: { params: { id: selected?.id } },
    routeName: `${baseRoute}.destroy` as RouteNameType,
    title: (
      <div className="flex items-center gap-2">
        <Trash2 className="size-5 text-red-400" />
        <span>
          Delete {pageTitle} ({selected?.name})
        </span>
      </div>
    ),
  })

  // Bulk Delete
  const { confirmModal: confirmBulkDel } = useDeleteGeneric({
    data: { ids: selectedRecords.map((r) => r.id) }, // Pass IDs as data payload
    isOpen: false,
    onClose: () => {},
    onSuccess: () => {
      setSelectedRecords([])
      searchFilter.doSearch()
    },
    routeName: `${baseRoute}.bulkDestroy` as RouteNameType,
    deleteParam: { params: {} }, // For bulk delete we delete using id in body
    title: <GenericDeleteTitle bulk={true} />,
    message: (
      <GenericBulkDeleteDescription length={selectedRecords.length}>
        {selectedRecords.map((r) => '> ' + r.name).join('\n')}
      </GenericBulkDeleteDescription>
    ),
  })

  // Columns
  const key = 'role-table'
  const columns: DataTableProps<DataType>['columns'] = [
    {
      accessor: 'name',
      title: 'Name',
      sortable: true,
      filter: () => {
        return (
          <FilterText
            column={'name'}
            searchFilter={searchFilter}
            label="Role Name"
            description="Filter by role name"
          />
        )
      },
      filtering: searchFilter.searchBy.name ? true : false,
    },
    {
      accessor: 'is_protected',
      title: 'Is Protected',
      toggleable: true,
      sortable: true,
      width: 200,
      render: (record) => <Text fz="sm">{record.is_protected ? <IconCheck /> : <IconX />}</Text>,
      filter: () => {
        return (
          <FilterRadio
            column={'is_protected'}
            searchFilter={searchFilter}
            label="Is Protected"
            description="Only show protected roles"
            data={[
              { value: 'true', label: 'Yes' },
              { value: 'false', label: 'No' },
            ]}
          />
        )
      },
      filtering: searchFilter.searchBy.is_protected ? true : false,
    },
    {
      accessor: 'created_at',
      toggleable: true,
      sortable: true,
      width: 200,
      render: ({ created_at }) => (
        <MantineTooltip label={dayjs(created_at).format('YYYY-MM-DD HH:mm:ss')}>
          <Text fz="sm">{dayjs(created_at).format('YYYY-MM-DD')}</Text>
        </MantineTooltip>
      ),
      filter: () => {
        return (
          <FilterDate
            column={'created_at'}
            searchFilter={searchFilter}
            label="Created At"
            description="Filter by created at"
          />
        )
      },
      filtering: searchFilter.searchBy.created_at ? true : false,
    },
    {
      accessor: 'updated_at',
      title: 'Updated At',
      toggleable: true,
      sortable: true,
      width: 200,
      render: ({ updated_at }) => (
        <MantineTooltip label={dayjs(updated_at).format('YYYY-MM-DD HH:mm:ss')}>
          <Text fz="sm">{dayjs(updated_at).format('YYYY-MM-DD')}</Text>
        </MantineTooltip>
      ),
      filter: () => {
        return (
          <FilterDate
            column={'updated_at'}
            searchFilter={searchFilter}
            label="Updated At"
            description="Filter by updated at"
          />
        )
      },
      filtering: searchFilter.searchBy.updated_at ? true : false,
    },
    {
      accessor: 'id',
      title: 'Actions',
      toggleable: false,
      sortable: false,
      width: 75,
      render: (record) => {
        const menuItem = (
          <div>
            <TooltipIfTrue isTrue={!canEdit} label="You don't have permission to edit roles">
              <Menu.Item
                fw={600}
                fz="sm"
                color="blue"
                variant="filled"
                component={!canEdit ? undefined : Link}
                leftSection={<IconEdit size={16} />}
                href={route(`${baseRoute}.edit`, { params: { id: record.id } }).path}
                disabled={!canEdit}
              >
                Edit
              </Menu.Item>
            </TooltipIfTrue>

            <TooltipIfTrue
              isTrue={!canDelete || record.is_protected}
              label={
                record.is_protected
                  ? 'Protected roles cannot be deleted'
                  : "You don't have permission to delete roles"
              }
            >
              <Menu.Item
                fw={600}
                fz="sm"
                color="red"
                variant="filled"
                leftSection={<IconTrash size={16} />}
                onClick={() => {
                  if (!canDelete) return
                  if (record.is_protected) return
                  setSelected(() => record)
                  onOpen()
                }}
                disabled={record.is_protected || !canDelete}
              >
                Delete
              </Menu.Item>
            </TooltipIfTrue>
          </div>
        )
        return (
          <Menu withArrow width={150} shadow="md">
            <Menu.Target>
              <div className="flex">
                <ActionIcon className="mx-auto" variant="light">
                  <IconDotsVertical size={16} />
                </ActionIcon>
              </div>
            </Menu.Target>
            <Menu.Dropdown>{menuItem}</Menu.Dropdown>
          </Menu>
        )
      },
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
        <Group>
          <TooltipIfTrue isTrue={!canAdd} label="You don't have permission to create a new role">
            <Button
              leftSection={<IconPlus size={18} />}
              href={route(`${baseRoute}.create`).path}
              component={canAdd ? Link : undefined}
              disabled={!canAdd}
            >
              Add
            </Button>
          </TooltipIfTrue>
        </Group>

        <Alert
          title="About Protected Roles"
          color="red"
          radius="md"
          mt="md"
          icon={<IconAlertCircle />}
        >
          If you want to set / unset a role as protected, you must edit it manually in the DB.
        </Alert>

        <Paper p="md" shadow="md" radius="md" withBorder mb={'md'}>
          <Group justify="space-between" mb="md">
            <Group>
              <Button
                color="red"
                leftSection={<IconTrash size={18} />}
                onClick={confirmBulkDel}
                disabled={selectedRecords.length === 0 || !canDelete}
              >
                {selectedRecords.length
                  ? `Delete Selected (${selectedRecords.length})`
                  : 'Batch Delete'}
              </Button>
            </Group>
            <Group ms={'auto'} gap={'xs'} justify="flex-end">
              <Group gap={'xs'} justify="flex-end">
                <TextInput
                  placeholder="Cari..."
                  leftSection={
                    searchFilter.isFetching ? <Loader size={16} /> : <IconSearch size={16} />
                  }
                  value={searchFilter.search}
                  onChange={(e) => {
                    searchFilter.onSearch(e.currentTarget.value)
                  }}
                  className={cn(classes.searchInput, {
                    [classes.appearAnimation]: searching,
                    [classes.disappearAnimation]: !searching,
                  })}
                />

                <MantineTooltip label="Cari" withArrow>
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

              <MantineTooltip label="Reset columns toggle state" withArrow>
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
          </Group>

          <DataTable
            minHeight={
              searchFilter.searchParamIsSet || searchFilter.isFetching || data.length === 0
                ? 200
                : undefined
            }
            verticalSpacing="xs"
            horizontalSpacing={'xs'}
            striped
            highlightOnHover
            withColumnBorders
            verticalAlign="top"
            storeColumnsKey={key}
            columns={effectiveColumns}
            records={data}
            selectedRecords={selectedRecords}
            fetching={searchFilter.isFetching}
            totalRecords={meta.total}
            recordsPerPage={meta.per_page}
            page={meta.current_page}
            recordsPerPageOptions={[5, 10, 15, 20, 50, 100, 200, 500, 1000]}
            onSelectedRecordsChange={(rec) => {
              const filtered = rec.filter((item) => !item.is_protected)
              setSelectedRecords(filtered)
            }}
            onPageChange={(page) => searchFilter.onPageChange(page)}
            onRecordsPerPageChange={(perPage) => searchFilter.onRecordsPerPage(perPage)}
            sortStatus={searchFilter.sortStatus as DataTableSortStatus<DataType>}
            onSortStatusChange={(sortStatus: DataTableSortStatus<DataType>) =>
              searchFilter.onSortStatus(sortStatus as DataTableSortStatus<any>)
            }
          />
        </Paper>
      </div>
    </DashboardLayout>
  )
}
