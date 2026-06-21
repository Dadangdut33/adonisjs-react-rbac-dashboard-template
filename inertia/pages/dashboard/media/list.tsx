import type { PaginationMeta } from '#types/app'

import { Head } from '@inertiajs/react'
import {
  ActionIcon,
  AspectRatio,
  Badge,
  Box,
  Card,
  Center,
  Checkbox,
  Code,
  CopyButton,
  Group,
  Image,
  Tooltip as MantineTooltip,
  Paper,
  SegmentedControl,
  SimpleGrid,
  Table,
  Text,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  IconCheck,
  IconCopy,
  IconEye,
  IconFileTypeDoc,
  IconFileTypePdf,
  IconFileTypeTxt,
  IconFileTypeXls,
  IconFileZip,
  IconLayoutGrid,
  IconList,
  IconMovie,
  IconMusic,
  IconPhoto,
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
import { useModals } from '~/components/core/modal/modal-hooks'
import { FilterDate } from '~/components/core/table-filter/date-filter'
import { FilterText } from '~/components/core/table-filter/text-filter'
import { TooltipIfTrue } from '~/components/core/tooltipper'
import { Data } from '~/generated/data'
import { useDeleteGeneric } from '~/hooks/use_generic_delete'
import useSearchFilter from '~/hooks/use_search_filter'
import DashboardLayout from '~/layouts/dashboard'
import { urlFor } from '~/lib/client'
import { formatBytes } from '~/lib/utils'
import { InertiaProps } from '~/types'

const baseRoute = 'media'
const basePerm = 'media'
const pageTitle = 'Media'
type PageProps = InertiaProps<{
  data: Data.Media[]
  meta: PaginationMeta
}>
type DataType = PageProps['data'][number]

function getIconForMime(mime: string, size = 20) {
  if (mime.startsWith('image/')) return <IconPhoto size={size} className="text-blue-500" />
  if (mime.startsWith('video/')) return <IconMovie size={size} className="text-red-500" />
  if (mime.startsWith('audio/')) return <IconMusic size={size} className="text-green-500" />
  if (mime === 'application/pdf') return <IconFileTypePdf size={size} className="text-red-600" />
  if (mime.includes('word') || mime.includes('document'))
    return <IconFileTypeDoc size={size} className="text-blue-600" />
  if (mime.includes('sheet') || mime.includes('excel'))
    return <IconFileTypeXls size={size} className="text-emerald-600" />
  if (mime.startsWith('text/')) return <IconFileTypeTxt size={size} className="text-slate-500" />
  if (mime.includes('zip') || mime.includes('compressed'))
    return <IconFileZip size={size} className="text-yellow-500" />
  return <IconFileTypeTxt size={size} className="text-gray-500" /> // Default fallback
}

function mediaTypeFromMime(mime: string) {
  if (mime.startsWith('image/')) return 'Image'
  if (mime.startsWith('video/')) return 'Video'
  if (mime.startsWith('audio/')) return 'Audio'
  return 'File'
}

function extensionFromRecord(record: DataType) {
  if (record.extension) return record.extension.toUpperCase()
  const last = record.name?.split('.')?.pop()
  return last ? last.toUpperCase() : 'FILE'
}

function previewItem(
  record: DataType,
  {
    width,
    height,
    avoidTopLeftOverlay = false,
  }: { width?: string; height?: string; avoidTopLeftOverlay?: boolean }
) {
  const badgePositionClass = avoidTopLeftOverlay ? 'right-2 top-2' : 'left-2 top-2'

  if (record.mime_type.startsWith('image/')) {
    return (
      <div className="relative h-full w-full">
        <div className={`absolute z-10 ${badgePositionClass}`}>
          <Badge size="xs" radius="sm" variant="filled" color="blue">
            Image
          </Badge>
        </div>
        <Image
          src={record.url}
          fit="cover"
          alt={record.name + ' ' + record.url}
          w={width ?? '100%'}
          h={height ?? '100%'}
        />
      </div>
    )
  }

  if (record.mime_type.startsWith('video/')) {
    return (
      <div className="relative h-full w-full overflow-hidden rounded-md bg-black">
        <div className={`absolute z-10 ${badgePositionClass}`}>
          <Badge size="xs" radius="sm" variant="filled" color="red">
            Video
          </Badge>
        </div>
        <video
          src={record.url}
          controls
          preload="metadata"
          className="h-full w-full object-cover"
          style={{ width: width ?? '100%', height: height ?? '100%' }}
        />
      </div>
    )
  }

  if (record.mime_type.startsWith('audio/')) {
    return (
      <Paper
        withBorder
        shadow="xs"
        radius="md"
        p="md"
        className="relative h-full w-full bg-gradient-to-br from-emerald-50 to-lime-50"
      >
        {avoidTopLeftOverlay ? (
          <div className="absolute right-2 top-2 z-10">
            <Badge size="xs" radius="sm" variant="filled" color="green">
              Audio
            </Badge>
          </div>
        ) : null}

        <Group justify="space-between" mb={8}>
          {avoidTopLeftOverlay ? (
            <div />
          ) : (
            <Badge size="xs" radius="sm" variant="filled" color="green">
              Audio
            </Badge>
          )}
          <Text c="dimmed" fz={10} fw={700}>
            {extensionFromRecord(record)}
          </Text>
        </Group>

        <Group gap={8} mb={10} wrap="nowrap">
          <div className="rounded-md border border-emerald-200 bg-white p-2">
            {getIconForMime(record.mime_type, 26)}
          </div>
          <Text fz="xs" fw={600} lineClamp={1}>
            {record.name}
          </Text>
        </Group>

        <audio src={record.url} controls className="w-full h-8" preload="metadata" />
      </Paper>
    )
  }

  return (
    <Paper
      withBorder
      shadow="xs"
      radius="md"
      p="md"
      className="relative h-full w-full bg-gradient-to-br from-slate-50 to-zinc-100"
    >
      {avoidTopLeftOverlay ? (
        <div className="absolute right-2 top-2 z-10">
          <Badge size="xs" radius="sm" variant="filled" color="gray">
            {mediaTypeFromMime(record.mime_type)}
          </Badge>
        </div>
      ) : null}

      <Group justify="space-between" mb={8}>
        {avoidTopLeftOverlay ? (
          <div />
        ) : (
          <Badge size="xs" radius="sm" variant="filled" color="gray">
            {mediaTypeFromMime(record.mime_type)}
          </Badge>
        )}
        <Text c="dimmed" fz={10} fw={700}>
          {extensionFromRecord(record)}
        </Text>
      </Group>

      <div className="flex h-full min-h-[110px] flex-col items-center justify-center gap-3 text-center">
        <div className="rounded-md border border-slate-200 bg-white p-3">
          {getIconForMime(record.mime_type, 30)}
        </div>
        <Text fz="xs" fw={600} c="dimmed" lineClamp={2}>
          {record.name}
        </Text>
      </div>
    </Paper>
  )
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

  const canView = props.user?.permissions.includes(`${basePerm}.view`)
  const canDelete = props.user?.permissions.includes(`${basePerm}.delete`)

  // State
  const searchFilter = useSearchFilter(`${baseRoute}.index`)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [selected, setSelected] = useState<DataType>()
  const [selectedRecords, setSelectedRecords] = useState<DataType[]>([])
  const [isOpen, { open: onOpen, close: onClose }] = useDisclosure(false)
  const [searching, setSearching] = useState(false)
  const { InfoModal } = useModals()

  const handleSearchingButton = () => {
    setSearching((prev) => !prev)
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
    deleteParam: { id: selected?.id ?? '' },
    routeName: `${baseRoute}.destroy`,
    title: (
      <div className="flex items-center gap-2">
        <Trash2 className="size-5 text-red-400" />
        <span>
          Delete {pageTitle} ({selected?.id})
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

  // View Metadata Modal
  const viewMetadata = (record: DataType) => {
    InfoModal({
      title: 'Media Metadata',
      message: (
        <Table withTableBorder withColumnBorders>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td fw={600} w={150}>
                ID
              </Table.Td>
              <Table.Td>
                <Group gap={5}>
                  <Code>{record.id}</Code>
                  <CopyButton value={record.id}>
                    {({ copied, copy }) => (
                      <ActionIcon variant="subtle" color={copied ? 'teal' : 'gray'} onClick={copy}>
                        {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                      </ActionIcon>
                    )}
                  </CopyButton>
                </Group>
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td fw={600}>Name</Table.Td>
              <Table.Td className="break-all">{record.name}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td fw={600}>Type</Table.Td>
              <Table.Td>
                <Badge variant="light">{record.mime_type}</Badge>
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td fw={600}>Size</Table.Td>
              <Table.Td>{formatBytes(record.size)}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td fw={600}>Drive Key</Table.Td>
              <Table.Td className="break-all">
                <Code className="break-all">{record.drive_key}</Code>
                <CopyButton value={record.drive_key}>
                  {({ copied, copy }) => (
                    <ActionIcon variant="subtle" color={copied ? 'teal' : 'gray'} onClick={copy}>
                      {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                    </ActionIcon>
                  )}
                </CopyButton>
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td fw={600}>Tags</Table.Td>
              <Table.Td className="break-all">
                <div className="flex flex-wrap gap-2">
                  {record.tags?.map((tag) => (
                    <Badge key={tag.id} variant="light">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td fw={600}>Hash</Table.Td>
              <Table.Td className="break-all">
                <Code className="break-all">{record.hash}</Code>
                <CopyButton value={record.hash}>
                  {({ copied, copy }) => (
                    <ActionIcon variant="subtle" color={copied ? 'teal' : 'gray'} onClick={copy}>
                      {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                    </ActionIcon>
                  )}
                </CopyButton>
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td fw={600}>Extension</Table.Td>
              <Table.Td>
                <Code>{record.extension}</Code>
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td fw={600}>Created</Table.Td>
              <Table.Td>{dayjs(record.created_at).format('YYYY-MM-DD HH:mm:ss')}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td fw={600}>Updated</Table.Td>
              <Table.Td>{dayjs(record.updated_at).format('YYYY-MM-DD HH:mm:ss')}</Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      ),
      confirmText: 'Close',
      width: 'lg',
    })()
  }

  // Columns
  const key = 'media-table'
  const columns: DataTableProps<DataType>['columns'] = [
    {
      accessor: 'preview',
      title: 'Preview',
      toggleable: true,
      render: (record) => {
        return previewItem(record, { width: '450px', height: '300px' })
      },
      width: 450,
    },
    {
      accessor: 'name',
      title: 'Name',
      toggleable: true,
      sortable: true,
      width: 200,
      filter: () => (
        <FilterText
          column={'name'}
          searchFilter={searchFilter}
          label="Name"
          description="Filter by name"
        />
      ),
      filtering: searchFilter.searchBy.name ? true : false,
      render: (record) => (
        <Text fz="sm" fw={500} className="break-all">
          {record.name}
        </Text>
      ),
    },
    {
      accessor: 'mime_type',
      title: 'Type',
      toggleable: true,
      sortable: true,
      width: 160,
      filter: () => (
        <FilterText
          column={'mime_type'}
          searchFilter={searchFilter}
          label="Mime Type"
          description="Filter by mime type"
        />
      ),
      filtering: searchFilter.searchBy.mime_type ? true : false,
    },
    {
      accessor: 'tags.name',
      title: 'Tags',
      toggleable: true,
      sortable: true,
      width: 160,
      filter: () => (
        <FilterText
          column={'tags.name'}
          searchFilter={searchFilter}
          label="Tags"
          description="Filter by tags"
        />
      ),
      render: (record) => (
        <div className="flex flex-wrap gap-2">
          {record.tags?.map((tag) => (
            <Badge key={tag.id} variant="light">
              {tag.name}
            </Badge>
          ))}
        </div>
      ),
      filtering: searchFilter.searchBy['tags.name'] ? true : false,
    },
    {
      accessor: 'size',
      title: 'Size',
      toggleable: true,
      sortable: true,
      width: 160,
      render: (record) => <Text fz="sm">{formatBytes(record.size)}</Text>,
      filter: () => (
        <FilterText
          column={'size'}
          searchFilter={searchFilter}
          label="Size"
          description="Filter by size"
        />
      ),
      filtering: searchFilter.searchBy.mime_type ? true : false,
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
      accessor: 'actions',
      title: 'Actions',
      width: 100,
      render: (record) => (
        <Group gap={5}>
          <TooltipIfTrue isTrue={!canView} label="Permission Denied">
            <ActionIcon
              variant="light"
              color="blue"
              onClick={() => {
                if (!canView) return
                viewMetadata(record)
              }}
              disabled={!canView}
            >
              <IconEye size={18} />
            </ActionIcon>
          </TooltipIfTrue>

          <TooltipIfTrue isTrue={!canDelete} label="Permission Denied">
            <ActionIcon
              variant="light"
              color="red"
              onClick={() => {
                if (!canDelete) return
                setSelected(record)
                onOpen()
              }}
              disabled={!canDelete}
            >
              <IconTrash size={18} />
            </ActionIcon>
          </TooltipIfTrue>
        </Group>
      ),
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
          showAddButton={false}
          addHref={urlFor(`${baseRoute}.create`)}
          onToggleSearch={handleSearchingButton}
          onBulkDelete={confirmBulkDel}
          onResetFilter={() => {
            searchFilter.resetSearch()
          }}
          onResetColumns={resetColumnState}
          labels={{
            noDeletePermission: "You don't have permission to delete media",
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
          <Group mb={'md'}>
            <SegmentedControl
              value={viewMode}
              onChange={(value) => setViewMode(value as 'list' | 'grid')}
              data={[
                {
                  label: (
                    <Center>
                      <IconList size={16} />
                      <Box ml={5}>List</Box>
                    </Center>
                  ),
                  value: 'list',
                },
                {
                  label: (
                    <Center>
                      <IconLayoutGrid size={16} />
                      <Box ml={5}>Gallery</Box>
                    </Center>
                  ),
                  value: 'grid',
                },
              ]}
            />
          </Group>

          {viewMode === 'list' ? (
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
          ) : (
            <SimpleGrid cols={{ base: 2, xs: 3, md: 4, lg: 5 }} spacing="md" verticalSpacing="md">
              {data.map((record) => {
                const isSelected = selectedRecords.some((r) => r.id === record.id)
                return (
                  <Card key={record.id} shadow="sm" padding="sm" radius="md" withBorder>
                    <Card.Section>
                      <AspectRatio ratio={1 / 1}>
                        <div className="relative w-full h-full bg-gray-100 flex items-center justify-center overflow-hidden">
                          {previewItem(record, { avoidTopLeftOverlay: true })}

                          <div className="absolute top-2 left-2 z-10">
                            <Checkbox
                              checked={isSelected}
                              onChange={(event) => {
                                const checked = event.currentTarget.checked
                                setSelectedRecords((prev) =>
                                  checked
                                    ? [...prev, record]
                                    : prev.filter((r) => r.id !== record.id)
                                )
                              }}
                            />
                          </div>
                        </div>
                      </AspectRatio>
                    </Card.Section>

                    <Group justify="space-between" mt="md" mb="xs">
                      <MantineTooltip label={record.name}>
                        <Text fw={500} truncate w={'70%'}>
                          {record.name}
                        </Text>
                      </MantineTooltip>
                      <Badge color="pink" variant="light">
                        {record.extension}
                      </Badge>
                    </Group>

                    <Text size="sm" c="dimmed" mb="xs">
                      {formatBytes(record.size)}
                    </Text>

                    <Group gap={5} justify="flex-end">
                      <TooltipIfTrue isTrue={!canView} label="Permission Denied">
                        <ActionIcon
                          variant="light"
                          color="blue"
                          onClick={() => {
                            if (!canView) return
                            viewMetadata(record)
                          }}
                          disabled={!canView}
                        >
                          <IconEye size={16} />
                        </ActionIcon>
                      </TooltipIfTrue>

                      <TooltipIfTrue isTrue={!canDelete} label="Permission Denied">
                        <ActionIcon
                          variant="light"
                          color="red"
                          onClick={() => {
                            if (!canDelete) return
                            setSelected(record)
                            onOpen()
                          }}
                          disabled={!canDelete}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </TooltipIfTrue>
                    </Group>
                  </Card>
                )
              })}
            </SimpleGrid>
          )}
        </Paper>
      </div>
    </DashboardLayout>
  )
}
