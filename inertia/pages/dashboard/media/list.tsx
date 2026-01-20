import MediaController from '#controllers/media.controller'
import { RouteNameType } from '#types/app'

import { InferPageProps, SharedProps } from '@adonisjs/inertia/types'
import { Head } from '@inertiajs/react'
import { route } from '@izzyjs/route/client'
import {
  ActionIcon,
  AspectRatio,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Checkbox,
  Code,
  CopyButton,
  Group,
  Image,
  Loader,
  Tooltip as MantineTooltip,
  Paper,
  SegmentedControl,
  SimpleGrid,
  Table,
  Text,
  TextInput,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  IconCheck,
  IconCopy,
  IconEye,
  IconFileTypePdf,
  IconFileZip,
  IconLayoutGrid,
  IconList,
  IconMovie,
  IconMusic,
  IconPhoto,
  IconSearch,
  IconTrash,
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
import { useModals } from '~/components/core/modal/modal-hooks'
import { FilterDate } from '~/components/core/table-filter/date-filter'
import { FilterText } from '~/components/core/table-filter/text-filter'
import { TooltipIfTrue } from '~/components/core/tooltipper'
import classes from '~/css/TableUtils.module.css'
import { useDeleteGeneric } from '~/hooks/use_generic_delete'
import useSearchFilter from '~/hooks/use_search_filter'
import DashboardLayout from '~/layouts/dashboard'
import { cn, formatBytes } from '~/lib/utils'

const baseRoute = 'media'
const basePerm = 'media'
const pageTitle = 'Media'
type PageProps = SharedProps & InferPageProps<MediaController, 'viewList'>
type DataType = PageProps['data'][number]

function getIconForMime(mime: string) {
  if (mime.startsWith('image/')) return <IconPhoto size={20} className="text-blue-500" />
  if (mime.startsWith('video/')) return <IconMovie size={20} className="text-red-500" />
  if (mime.startsWith('audio/')) return <IconMusic size={20} className="text-green-500" />
  if (mime === 'application/pdf') return <IconFileTypePdf size={20} className="text-red-600" />
  if (mime.includes('zip') || mime.includes('compressed'))
    return <IconFileZip size={20} className="text-yellow-500" />
  return <IconFileTypePdf size={20} className="text-gray-500" /> // Default fallback
}

function previewItem(record: DataType, { width, height }: { width?: string; height?: string }) {
  return record.mime_type.startsWith('image/') ? (
    <Image
      src={record.url}
      fit="cover"
      w={width ?? '100%'}
      h={height ?? '100%'}
      fallbackSrc="https://placehold.co/200x200?text=Err"
    />
  ) : record.mime_type.startsWith('video/') ? (
    <video src={record.url} controls className="w-full h-full object-cover" />
  ) : record.mime_type.startsWith('audio/') ? (
    <div className="w-full h-full flex items-center justify-center p-4 bg-gray-50">
      <audio src={record.url} controls className="w-full" />
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center text-gray-400">
      {getIconForMime(record.mime_type)}
    </div>
  )
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

  const canView = props.user?.permissions.includes(`${basePerm}.view`)
  const canDelete = props.user?.permissions.includes(`${basePerm}.delete`)

  // State
  const searchFilter = useSearchFilter(`${baseRoute}.index` as RouteNameType)
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
    deleteParam: { params: { id: selected?.id } },
    routeName: `${baseRoute}.destroy` as RouteNameType,
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
    routeName: `${baseRoute}.bulkDestroy` as RouteNameType,
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
                    <Badge key={tag} variant="light">
                      {tag}
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
        return previewItem(record, { width: '200px', height: '200px' })
      },
      width: 250,
    },
    {
      accessor: 'name',
      title: 'Name',
      toggleable: true,
      sortable: true,
      width: 350,
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
      accessor: 'tags',
      title: 'Tags',
      toggleable: true,
      sortable: true,
      width: 160,
      filter: () => (
        <FilterText
          column={'tags'}
          searchFilter={searchFilter}
          label="Tags"
          description="Filter by tags"
        />
      ),
      render: (record) => (
        <div className="flex flex-wrap gap-2">
          {record.tags?.map((tag) => (
            <Badge key={tag} variant="light">
              {tag}
            </Badge>
          ))}
        </div>
      ),
      filtering: searchFilter.searchBy.tags ? true : false,
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

              {viewMode === 'list' && (
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
              )}
            </Group>
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
              recordsPerPageOptions={[5, 10, 15, 20, 50, 100]}
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
                          {previewItem(record, {})}

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
