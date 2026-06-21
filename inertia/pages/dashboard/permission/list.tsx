import type { PaginationMeta } from '#types/app'

import { Link } from '@adonisjs/inertia/react'
import { Head } from '@inertiajs/react'
import { ActionIcon, Alert, Tooltip as MantineTooltip, Menu, Paper, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  IconAlertCircle,
  IconCheck,
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconX,
} from '@tabler/icons-react'
import dayjs from 'dayjs'
import { Trash2 } from 'lucide-react'
import {
  DataTable,
  DataTableProps,
  DataTableSortStatus,
  useDataTableColumns,
} from 'mantine-datatable'
import { useState } from 'react'
import { DashboardSearchPanel } from '~/components/core/dashboard/search-panel'
import { DashboardTableButtons } from '~/components/core/dashboard/table-buttons'
import { GenericBulkDeleteDescription, GenericDeleteTitle } from '~/components/core/delete-helper'
import { FilterDate } from '~/components/core/table-filter/date-filter'
import { FilterRadio } from '~/components/core/table-filter/radio-filter'
import { FilterText } from '~/components/core/table-filter/text-filter'
import { TooltipIfTrue } from '~/components/core/tooltipper'
import { Data } from '~/generated/data'
import { useDeleteGeneric } from '~/hooks/use_generic_delete'
import useSearchFilter from '~/hooks/use_search_filter'
import DashboardLayout from '~/layouts/dashboard'
import { urlFor } from '~/lib/client'
import { InertiaProps } from '~/types'

const baseRoute = 'permission'
const basePerm = 'permission'
const pageTitle = 'Permission'
type PageProps = InertiaProps<{
  data: Data.Permission[]
  meta: PaginationMeta
}>
type DataType = PageProps['data'][number]

export default function page(props: PageProps) {
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

  const canAdd = props.user?.permissions.includes(`${basePerm}.create`)
  const canEdit = props.user?.permissions.includes(`${basePerm}.update`)
  const canDelete = props.user?.permissions.includes(`${basePerm}.delete`)

  // State
  const searchFilter = useSearchFilter(`${baseRoute}.index`)
  const [selected, setSelected] = useState<DataType>()
  const [selectedRecords, setSelectedRecords] = useState<DataType[]>([])
  const [isOpen, { open: onOpen, close: onClose }] = useDisclosure(false)
  const [searching, setSearching] = useState(false)
  const handleSearchingButton = () => {
    setSearching((prev) => {
      return !prev
    })
  }

  // single Delete modal
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
    deleteParam: { id: selected?.id ?? '' },
    routeName: `${baseRoute}.destroy`,
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
    routeName: `${baseRoute}.bulkDestroy`,
    deleteParam: { params: {} }, // For bulk delete we delete using id in body
    title: <GenericDeleteTitle bulk={true} />,
    message: (
      <GenericBulkDeleteDescription length={selectedRecords.length}>
        {selectedRecords.map((r) => '> ' + r.name).join('\n')}
      </GenericBulkDeleteDescription>
    ),
  })

  // Columns
  const key = 'permission-table'
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
            label="Permission Name"
            description="Filter by permission name"
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
            description="Only show protected permissions"
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
                component={record.is_protected || !canEdit ? undefined : Link}
                leftSection={<IconEdit size={16} />}
                href={urlFor(`${baseRoute}.edit`, { id: record.id })}
                disabled={record.is_protected || !canEdit}
              >
                Edit
              </Menu.Item>
            </TooltipIfTrue>

            <TooltipIfTrue isTrue={!canDelete} label="You don't have permission to delete roles">
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
            <Menu.Dropdown>
              {/* Delete is disabled if protected */}
              {record.is_protected ? (
                <MantineTooltip label="*Protected item cannot be modified" withArrow>
                  {menuItem}
                </MantineTooltip>
              ) : (
                menuItem
              )}
            </Menu.Dropdown>
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
  const resetColumnState = () => {
    resetColumnsToggle()
    resetColumnsWidth()
    resetColumnsOrder()
  }

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <Head title={pageTitle} />
      <div className="space-y-4">
        <Alert
          title="About Protected Permissions"
          color="red"
          radius="md"
          mt="md"
          icon={<IconAlertCircle />}
        >
          Permission is tied to each action in the server. Because of that, it is designed so that
          if you want to to set / unset permission as protected, you must edit it manually in the
          DB.
          <br />
          This is done so that critical part of the application does not get messed up by mistake.
          To change what is a role allowed to do, you may go to the role page and edit its
          coresponding permissions.
        </Alert>

        <DashboardTableButtons
          searching={searching}
          canResetSearch={searchFilter.searchParamIsSet}
          selectedRecords={selectedRecords}
          canDelete={canDelete}
          canAdd={canAdd}
          showAddButton={true}
          addHref={urlFor(`${baseRoute}.create`)}
          onToggleSearch={handleSearchingButton}
          onBulkDelete={confirmBulkDel}
          onResetFilter={() => {
            searchFilter.resetSearch()
          }}
          onResetColumns={resetColumnState}
          labels={{
            noDeletePermission: "You don't have permission to delete role",
            noAddPermission: "You don't have permission to add role",
            bulkDeleteMin: 'Select at least 1 record to delete',
          }}
        />

        <DashboardSearchPanel
          opened={searching}
          value={searchFilter.search}
          onChange={(value) => searchFilter.onSearch(value)}
          placeholder={`Search ${pageTitle.toLowerCase()}...`}
        />

        <Paper p="md" shadow="md" radius="md" withBorder mb={'md'}>
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
