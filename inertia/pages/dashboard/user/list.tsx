import UserController from '#controllers/user.controller'
import { RouteNameType } from '#types/app'
import { AuthUser } from '#types/models'

import { InferPageProps, SharedProps } from '@adonisjs/inertia/types'
import { Head, Link } from '@inertiajs/react'
import { route } from '@izzyjs/route/client'
import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Flex,
  Group,
  Loader,
  Tooltip as MantineTooltip,
  Menu,
  Paper,
  Stack,
  Text,
  TextInput,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
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
import React, { useState } from 'react'
import { FilterBoolean } from '~/components/core/table-filter/boolean-filter'
import { FilterDate } from '~/components/core/table-filter/date-filter'
import { FilterText } from '~/components/core/table-filter/text-filter'
import { TooltipIfTrue } from '~/components/core/tooltipper'
import classes from '~/css/TableUtils.module.css'
import { useDeleteGeneric } from '~/hooks/use_generic_delete'
import useSearchFilter from '~/hooks/use_search_filter'
import DashboardLayout from '~/layouts/dashboard'
import { cn, getInitials } from '~/lib/utils'

const baseRoute = 'user'
const basePerm = 'user'
const pageTitle = 'User'
type PageProps = SharedProps & InferPageProps<UserController, 'viewList'>
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

const disableBtnCheck = (current: AuthUser, target: DataType) => {
  if (current.id === target.id) {
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
      href: route('dashboard.view').path,
    },
    {
      title: pageTitle,
      href: props.currentPath,
    },
  ]

  // Data
  const { data, meta } = props
  console.log(data)

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

  // Delete modal
  const { confirmModal: _confirmDel, deleteMutation: _delMutation } = useDeleteGeneric({
    isOpen,
    onClose,
    data: selected,
    onSuccess: () => {
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
          Delete {pageTitle} ({selected?.full_name})
        </span>
      </div>
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
                href={route(`${baseRoute}.edit`, { params: { id: record.id } }).path}
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
                  disabled={disableBtnCheck(props.user!, record)}
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

        <Paper p="md" shadow="md" radius="md" withBorder mb={'md'}>
          <Group justify="space-between" mb="md">
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

              <MantineTooltip label="Reset columns state" withArrow>
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
            minHeight={searchFilter.searchParamIsSet || searchFilter.isFetching ? 200 : undefined}
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
            onSelectedRecordsChange={setSelectedRecords}
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
