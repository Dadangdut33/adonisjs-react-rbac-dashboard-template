import PermissionController from '#controllers/permission.controller'
import { RouteNameType } from '#types/app'

import { InferPageProps, SharedProps } from '@adonisjs/inertia/types'
import { PermissionDto } from '@app/dtos/permission_dto'
import { Head, Link } from '@inertiajs/react'
import { route } from '@izzyjs/route/client'
import {
  ActionIcon,
  Group,
  Loader,
  Tooltip as MantineTooltip,
  Menu,
  Paper,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconDotsVertical, IconEdit, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react'
import dayjs from 'dayjs'
import { Trash2 } from 'lucide-react'
import { DataTable, DataTableProps, DataTableSortStatus } from 'mantine-datatable'
import { useState } from 'react'
import { Button } from '~/components/ui/button'
import classes from '~/css/TableUtils.module.css'
import { useDeleteGeneric } from '~/hooks/use_generic_delete'
import useSearchFilter from '~/hooks/use_search_filter'
import DashboardLayout from '~/layouts/dashboard'
import { cn } from '~/lib/utils'

const baseRoute = 'permission'
const pageTitle = 'Permission'
type DataType = PermissionDto

export default function page(
  props: SharedProps & InferPageProps<PermissionController, 'viewList'>
) {
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

  // Columns
  const columns: DataTableProps<DataType>['columns'] = [
    {
      accessor: 'name',
      title: 'Name',
      sortable: true,
    },
    {
      accessor: 'is_protected',
      title: 'Is Protected',
      sortable: true,
      width: 150,
      render: (data) => <Text fz="sm">{data.is_protected ? 'Yes' : 'No'}</Text>,
    },
    {
      accessor: 'created_at',
      sortable: true,
      width: 125,
      render: ({ created_at }) => (
        <Tooltip label={dayjs(created_at).format('YYYY-MM-DD HH:mm:ss')}>
          <Text fz="sm">{dayjs(created_at).format('YYYY-MM-DD')}</Text>
        </Tooltip>
      ),
    },
    {
      accessor: 'updated_at',
      sortable: true,
      width: 125,
      render: ({ updated_at }) => (
        <Tooltip label={dayjs(updated_at).format('YYYY-MM-DD HH:mm:ss')}>
          <Text fz="sm">{dayjs(updated_at).format('YYYY-MM-DD')}</Text>
        </Tooltip>
      ),
    },
    {
      accessor: 'id',
      title: 'Actions',
      sortable: false,
      width: 75,
      render: (data) => {
        const deleteMenuItem = (
          <Menu.Item
            fw={600}
            fz="sm"
            color="red"
            variant="filled"
            leftSection={<IconTrash size={16} />}
            onClick={() => {
              if (data.is_protected) return
              setSelected(() => data)
              onOpen()
            }}
            disabled={data.is_protected}
          >
            Delete
          </Menu.Item>
        )
        return (
          <Menu withArrow width={150} shadow="md">
            <Menu.Target>
              <div className="flex">
                <ActionIcon className="mx-auto">
                  <IconDotsVertical size={16} />
                </ActionIcon>
              </div>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                fw={600}
                fz="sm"
                color="blue"
                variant="filled"
                component={Link}
                leftSection={<IconEdit size={16} />}
                href={route(`${baseRoute}.edit`, { params: { id: data.id } }).path}
              >
                Edit
              </Menu.Item>
              {/* Delete is disabled if protected */}
              {data.is_protected ? (
                <Tooltip label="Protected item cannot be deleted" withArrow>
                  {deleteMenuItem}
                </Tooltip>
              ) : (
                deleteMenuItem
              )}
            </Menu.Dropdown>
          </Menu>
        )
      },
    },
  ]

  // TODO for the table part: search per column

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <Head title="Permission" />
      <div className="space-y-4">
        <div>
          <Link href={route(`${baseRoute}.create`).path}>
            <Button>
              <IconPlus size={18} />
              Add
            </Button>
          </Link>
        </div>

        <Paper p="md" shadow="md" radius="md" withBorder mb={'md'}>
          <Group justify="space-between" mb="md">
            <Group ms={'auto'} gap={'xs'} justify="flex-end">
              <Group gap={'xs'} justify="flex-end">
                <TextInput
                  placeholder="Search..."
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
            </Group>
          </Group>

          <DataTable
            minHeight={200}
            verticalSpacing="xs"
            striped
            highlightOnHover
            columns={columns}
            records={data}
            selectedRecords={selectedRecords}
            fetching={searchFilter.isFetching}
            totalRecords={meta.total}
            recordsPerPage={meta.per_page}
            page={meta.current_page}
            recordsPerPageOptions={[5, 10, 15, 20, 50, 100]}
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
