import type { PaginationMeta } from '#types/app'
import type { AuthUser } from '#types/models'

import { Link } from '@adonisjs/inertia/react'
import { Head } from '@inertiajs/react'
import {
  ActionIcon,
  Avatar,
  Badge,
  Flex,
  Group,
  Tooltip as MantineTooltip,
  Menu,
  Paper,
  Stack,
  Text,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconCheck, IconDotsVertical, IconEdit, IconTrash, IconX } from '@tabler/icons-react'
import dayjs from 'dayjs'
import { Trash2 } from 'lucide-react'
import {
  DataTable,
  DataTableProps,
  DataTableSortStatus,
  useDataTableColumns,
} from 'mantine-datatable'
import React, { useState } from 'react'
import { DashboardSearchPanel } from '~/components/core/dashboard/search-panel'
import { DashboardTableButtons } from '~/components/core/dashboard/table-buttons'
import { GenericBulkDeleteDescription, GenericDeleteTitle } from '~/components/core/delete-helper'
import { FilterBoolean } from '~/components/core/table-filter/boolean-filter'
import { FilterDate } from '~/components/core/table-filter/date-filter'
import { FilterText } from '~/components/core/table-filter/text-filter'
import { TooltipIfTrue } from '~/components/core/tooltipper'
import { Data } from '~/generated/data'
import { useDeleteGeneric } from '~/hooks/use_generic_delete'
import useSearchFilter from '~/hooks/use_search_filter'
import DashboardLayout from '~/layouts/dashboard'
import { urlFor } from '~/lib/client'
import { getInitials } from '~/lib/utils'
import { InertiaProps } from '~/types'

const baseRoute = 'user'
const basePerm = 'user'
const pageTitle = 'User'
type PageProps = InertiaProps<{
  data: Data.User[]
  meta: PaginationMeta
}>
type DataType = PageProps['data'][number]

function mapRoleToBadgeComponent(role: string) {
  let color = 'blue'

  switch (role) {
    case 'Admin':
      color = 'green'
      break
    case 'Super Admin':
      color = 'red'
      break
  }

  return (
    <Badge color={color} variant="filled" size="sm" radius="sm">
      {role}
    </Badge>
  )
}

const disableBtnCheck = (current: AuthUser, target: DataType, allowEditOwnAccount = false) => {
  if (!allowEditOwnAccount && current.id === target.id) {
    return true // Disable button if it's the current user
  }

  const targetUserIsAdmin = target.roles?.some(
    (role) => role.name === 'Admin' || role.name === 'Super Admin'
  )
  const currentUserIsSuperAdmin = current.roles.some((role) => role === 'Super Admin')
  if (targetUserIsAdmin && !currentUserIsSuperAdmin) {
    return true // if target is admin or super admin, user must be super admin to perform action
  }

  return false
}

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

  // Delete modal
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
          Delete {pageTitle} ({selected?.full_name})
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
        {selectedRecords.map((r) => '> ' + r.full_name).join('\n')}
      </GenericBulkDeleteDescription>
    ),
  })

  // Columns
  const key = 'user-table'
  const columns: DataTableProps<DataType>['columns'] = [
    {
      accessor: 'full_name',
      title: 'Name',
      sortable: true,
      filter: () => {
        return (
          <FilterText
            column={'full_name'}
            searchFilter={searchFilter}
            label="Name"
            description="Filter by user's name"
          />
        )
      },
      render(record) {
        return (
          <Flex gap="xs" align="center">
            <Avatar
              variant="filled"
              radius="xl"
              size="md"
              src={record.profile?.avatarUrl}
              alt={`${record.full_name}'s Avatar`}
            >
              {getInitials(record.full_name || 'Uknown')}
            </Avatar>
            <Stack gap={0}>
              <Text fz="sm" fw={600}>
                {record.full_name}
              </Text>
              <Text fz="xs">{record.email}</Text>
            </Stack>
          </Flex>
        )
      },
      filtering: searchFilter.searchBy.full_name ? true : false,
    },
    {
      accessor: 'username',
      title: 'Username',
      toggleable: true,
      sortable: true,
      filter: () => {
        return (
          <FilterText
            column={'username'}
            searchFilter={searchFilter}
            label="Username"
            description="Filter by user's username"
          />
        )
      },
      filtering: searchFilter.searchBy.username ? true : false,
    },
    {
      accessor: 'email',
      title: 'Email',
      toggleable: true,
      sortable: true,
      width: 200,
      filter: () => {
        return (
          <FilterText
            column={'email'}
            searchFilter={searchFilter}
            label="Email"
            description="Filter by user's email"
          />
        )
      },
      filtering: searchFilter.searchBy.email ? true : false,
    },
    {
      accessor: 'is_email_verified',
      title: 'Email Verified',
      toggleable: true,
      sortable: true,
      width: 210,
      render: (record) => (
        <Text fz="sm">{record.is_email_verified ? <IconCheck /> : <IconX />}</Text>
      ),
      filter: () => {
        return (
          <FilterBoolean
            column={'is_email_verified'}
            searchFilter={searchFilter}
            label="Email Verified"
            description="Filter by user's email verification status"
          />
        )
      },
      filtering: searchFilter.searchBy.is_email_verified ? true : false,
    },
    {
      accessor: 'roles.name',
      toggleable: true,
      sortable: true,
      // sortKey: 'roles.name', // sortkey does not work idk so we use the accessor
      title: 'Roles',
      width: 160,
      render(record) {
        if (!record.roles || record.roles.length < 1) return <p>No Role Set</p>

        return (
          <Group gap="xs">
            {record.roles.map((role) => (
              <React.Fragment key={role.id}> {mapRoleToBadgeComponent(role.name)}</React.Fragment>
            ))}
          </Group>
        )
      },
      filter: () => {
        return (
          <FilterText
            column={'roles.name'}
            searchFilter={searchFilter}
            label="Roles"
            description="Filter by user's roles"
          />
        )
      },
      filtering: searchFilter.searchBy.roles ? true : false,
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
            <TooltipIfTrue isTrue={!canEdit} label="You don't have permission to edit user">
              <Menu.Item
                fw={600}
                fz="sm"
                color="blue"
                variant="filled"
                component={Link}
                leftSection={<IconEdit size={16} />}
                href={urlFor(`${baseRoute}.edit`, { id: record.id })}
              >
                Edit
              </Menu.Item>
            </TooltipIfTrue>

            <TooltipIfTrue isTrue={!canDelete} label="You don't have permission to delete user">
              <Menu.Item
                fw={600}
                fz="sm"
                color="red"
                variant="filled"
                leftSection={<IconTrash size={16} />}
                onClick={() => {
                  setSelected(() => record)
                  onOpen()
                }}
                disabled={disableBtnCheck(props.user!, record, false)}
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
                <ActionIcon
                  className="mx-auto"
                  variant="light"
                  disabled={disableBtnCheck(props.user!, record, true)}
                >
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
  const resetColumnState = () => {
    resetColumnsToggle()
    resetColumnsWidth()
    resetColumnsOrder()
  }

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <Head title={pageTitle} />
      <div className="space-y-4">
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
            noDeletePermission: "You don't have permission to delete user",
            noAddPermission: "You don't have permission to add new user",
            bulkDeleteMin: 'Select at least 1 record to delete',
          }}
        />

        <DashboardSearchPanel
          opened={searching}
          value={searchFilter.search}
          onChange={(value) => searchFilter.onSearch(value)}
          placeholder={`Search ${pageTitle.toLowerCase()}...`}
        />

        <Paper p="xs" shadow="md" radius="md" withBorder>
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
            onSelectedRecordsChange={(record) => {
              const filtered = record.filter((r) => !disableBtnCheck(props.user!, r, false))
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
