import type { PaginationMeta } from '#types/app'

import { Link } from '@adonisjs/inertia/react'
import { Head } from '@inertiajs/react'
import {
  ActionIcon,
  Alert,
  Badge,
  Group,
  Tooltip as MantineTooltip,
  Menu,
  Paper,
  Text,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  IconAlertCircle,
  IconDotsVertical,
  IconEdit,
  IconExternalLink,
  IconHistory,
  IconTrash,
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
import ImageWithLoader from '~/components/core/image'
import { FilterDate } from '~/components/core/table-filter/date-filter'
import { FilterText } from '~/components/core/table-filter/text-filter'
import { TooltipIfTrue } from '~/components/core/tooltipper'
import { Data } from '~/generated/data'
import { useDeleteGeneric } from '~/hooks/use_generic_delete'
import useSearchFilter from '~/hooks/use_search_filter'
import DashboardLayout from '~/layouts/dashboard'
import { urlFor } from '~/lib/client'
import { InertiaProps } from '~/types'

const baseRoute = 'blog'
const basePerm = 'blog'
const pageTitle = 'Blog'
type PageProps = InertiaProps<{
  data: Data.Blog[]
  meta: PaginationMeta
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

  const { data, meta } = props

  const canAdd = props.user?.permissions.includes(`${basePerm}.create`)
  const canEdit = props.user?.permissions.includes(`${basePerm}.update`)
  const canDelete = props.user?.permissions.includes(`${basePerm}.delete`)
  const canPreviewInactive = canAdd || canEdit

  const searchFilter = useSearchFilter(`${baseRoute}.index`)
  const [selected, setSelected] = useState<DataType>()
  const [selectedRecords, setSelectedRecords] = useState<DataType[]>([])
  const [isOpen, { open: onOpen, close: onClose }] = useDisclosure(false)
  const [searching, setSearching] = useState(false)

  const handleSearchingButton = () => {
    setSearching((prev) => !prev)
  }

  useDeleteGeneric({
    isOpen,
    onClose,
    data: selected,
    onSuccess: () => {
      const deleted = selected
      setSelectedRecords((prev) => prev.filter((r) => r.id !== deleted?.id))
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
          Delete {pageTitle} ({selected?.title})
        </span>
      </div>
    ),
  })

  const { confirmModal: confirmBulkDel } = useDeleteGeneric({
    data: { ids: selectedRecords.map((r) => r.id) },
    isOpen: false,
    onClose: () => {},
    onSuccess: () => {
      setSelectedRecords([])
      searchFilter.doSearch()
    },
    routeName: `${baseRoute}.bulkDestroy`,
    deleteParam: { params: {} },
    title: <GenericDeleteTitle bulk={true} />,
    message: (
      <GenericBulkDeleteDescription length={selectedRecords.length}>
        {selectedRecords.map((r) => '> ' + r.title).join('\n')}
      </GenericBulkDeleteDescription>
    ),
  })

  const key = 'blog-table'
  const columns: DataTableProps<DataType>['columns'] = [
    {
      accessor: 'thumbnail',
      title: 'Thumbnail',
      sortable: false,
      width: 200,
      render: (record) =>
        record.thumbnail?.url ? (
          <ImageWithLoader
            src={record.thumbnail.url}
            alt={record.title}
            w={200}
            h={120}
            height={120}
            radius="sm"
            fit="cover"
            fallbackSrc="https://placehold.co/200x200?text=No+Image"
          />
        ) : (
          <Text fz="xs" c="dimmed">
            No image
          </Text>
        ),
    },
    {
      accessor: 'title',
      title: 'Title',
      width: 150,
      sortable: true,
      filter: () => (
        <FilterText
          column={'title'}
          searchFilter={searchFilter}
          label="Title"
          description="Filter by title"
        />
      ),
      filtering: searchFilter.searchBy.title ? true : false,
    },
    {
      accessor: 'url_path',
      title: 'URL Preview',
      sortable: false,
      render: (record) => (
        <Text fz="sm" c="dimmed">
          {record.url_path}
        </Text>
      ),
    },
    {
      accessor: 'is_active',
      title: 'Active',
      sortable: true,
      width: 100,
      render: (record) => (
        <Badge color={record.is_active ? 'green' : 'gray'} variant="light">
          {record.is_active ? 'Yes' : 'No'}
        </Badge>
      ),
    },
    {
      accessor: 'is_pinned',
      title: 'Pinned',
      sortable: true,
      width: 100,
      render: (record) => (
        <Badge color={record.is_pinned ? 'yellow' : 'gray'} variant="light">
          {record.is_pinned ? 'Yes' : 'No'}
        </Badge>
      ),
    },
    {
      accessor: 'slug_id',
      title: 'Slug',
      sortable: true,
      filter: () => (
        <FilterText
          column={'slug_id'}
          searchFilter={searchFilter}
          label="Slug"
          description="Filter by slug"
        />
      ),
      filtering: searchFilter.searchBy.slug_id ? true : false,
    },
    {
      accessor: 'description',
      title: 'Description',
      sortable: false,
      width: 280,
      render: (record) => (
        <Text fz="sm" c="dimmed" lineClamp={2}>
          {record.description || '-'}
        </Text>
      ),
      filter: () => (
        <FilterText
          column={'description'}
          searchFilter={searchFilter}
          label="Description"
          description="Filter by description"
        />
      ),
      filtering: searchFilter.searchBy.description ? true : false,
    },
    {
      accessor: 'tags',
      title: 'Tags',
      width: 150,
      sortable: false,
      render: (record) => (
        <Group gap={6}>
          {record.tags?.map((tag) => (
            <Badge key={tag.id} variant="light">
              {tag.name}
            </Badge>
          ))}
        </Group>
      ),
    },
    {
      accessor: 'created_at',
      title: 'Created At',
      toggleable: true,
      sortable: true,
      width: 200,
      render: ({ created_at }) => (
        <MantineTooltip label={dayjs(created_at).format('YYYY-MM-DD HH:mm:ss')}>
          <Text fz="sm">{dayjs(created_at).format('YYYY-MM-DD')}</Text>
        </MantineTooltip>
      ),
      filter: () => (
        <FilterDate
          column={'created_at'}
          searchFilter={searchFilter}
          label="Created At"
          description="Filter by created at"
        />
      ),
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
      filter: () => (
        <FilterDate
          column={'updated_at'}
          searchFilter={searchFilter}
          label="Updated At"
          description="Filter by updated at"
        />
      ),
      filtering: searchFilter.searchBy.updated_at ? true : false,
    },
    {
      accessor: 'id',
      title: 'Actions',
      toggleable: false,
      sortable: false,
      width: 75,
      render: (record) => {
        return (
          <Menu withArrow width={180} shadow="md">
            <Menu.Target>
              <div className="flex">
                <ActionIcon className="mx-auto" variant="light">
                  <IconDotsVertical size={16} />
                </ActionIcon>
              </div>
            </Menu.Target>
            <Menu.Dropdown>
              <TooltipIfTrue isTrue={!canEdit} label="You don't have permission to edit blog">
                <Menu.Item
                  fw={600}
                  fz="sm"
                  color="blue"
                  variant="filled"
                  component={!canEdit ? undefined : Link}
                  leftSection={<IconEdit size={16} />}
                  href={urlFor(`${baseRoute}.edit`, { id: record.id })}
                  disabled={!canEdit}
                >
                  Edit
                </Menu.Item>
              </TooltipIfTrue>
              <TooltipIfTrue isTrue={!canEdit} label="You don't have permission to rollback blog">
                <Menu.Item
                  fw={600}
                  fz="sm"
                  color="orange"
                  variant="filled"
                  component={!canEdit ? undefined : Link}
                  leftSection={<IconHistory size={16} />}
                  href={`${urlFor(`${baseRoute}.edit`, { id: record.id })}?tab=rollback`}
                  disabled={!canEdit}
                >
                  Rollback
                </Menu.Item>
              </TooltipIfTrue>
              <Menu.Item
                fw={600}
                fz="sm"
                color="teal"
                variant="filled"
                component="a"
                leftSection={<IconExternalLink size={16} />}
                href={record.url_path}
                target="_blank"
                rel="noopener noreferrer"
                disabled={!record.is_active && !canPreviewInactive}
              >
                View Post
              </Menu.Item>

              <TooltipIfTrue isTrue={!canDelete} label="You don't have permission to delete blog">
                <Menu.Item
                  fw={600}
                  fz="sm"
                  color="red"
                  variant="filled"
                  leftSection={<IconTrash size={16} />}
                  onClick={() => {
                    if (!canDelete) return
                    setSelected(() => record)
                    onOpen()
                  }}
                  disabled={!canDelete}
                >
                  Delete
                </Menu.Item>
              </TooltipIfTrue>
            </Menu.Dropdown>
          </Menu>
        )
      },
    },
  ]

  const { effectiveColumns, resetColumnsToggle, resetColumnsWidth, resetColumnsOrder } =
    useDataTableColumns<DataType>({
      key,
      columns,
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
        {!canDelete && (
          <Alert icon={<IconAlertCircle size={16} />} title="Access" color="yellow" variant="light">
            You can view data, but delete actions are disabled due to permissions.
          </Alert>
        )}

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
            noDeletePermission: "You don't have permission to delete blog",
            noAddPermission: "You don't have permission to add blog",
            bulkDeleteMin: 'Select at least 1 record to delete',
          }}
        />

        <DashboardSearchPanel
          opened={searching}
          value={searchFilter.search}
          onChange={(value) => searchFilter.onSearch(value)}
          placeholder={`Search ${pageTitle.toLowerCase()}...`}
        />

        <Paper p="xs" shadow="md" radius="md" withBorder mb={'md'}>
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
