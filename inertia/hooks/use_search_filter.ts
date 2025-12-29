import { RouteNameType } from '#types/app'

import { router } from '@inertiajs/react'
import { route } from '@izzyjs/route/client'
import { useDebouncedCallback } from '@mantine/hooks'
import { DataTableSortStatus } from 'mantine-datatable'
import { useEffect, useState } from 'react'

type SearchFilerProps<T> = {
  isFetching: boolean
  search: string
  setSearch: (e: string) => void
  doSearch: (q?: string) => void
  onSearch: (e: string) => void
  onPageChange: (e: number) => void
  onRecordsPerPage: (e: number) => void
  onQueryTable: (queryKey: string, queryValue: string | null) => void
  sortStatus: DataTableSortStatus<T>
  onSortStatus: (e: DataTableSortStatus<T>) => void
}

export default function useSearchFilter<T>(
  endpoint: RouteNameType,
  defaultColumnSort = 'updated_at'
): SearchFilerProps<T> {
  const [search, setSearch] = useState<string>('')
  const [isFetching, setIsFetching] = useState<boolean>(false)
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<T>>({
    columnAccessor: defaultColumnSort,
    direction: 'desc',
  })

  router.on('start', () => setIsFetching(() => true))
  router.on('finish', () => setIsFetching(() => false))

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search)
    setSearch(queryParams.get('search') ?? '')

    // Set sort status based on query params
    const sort = queryParams.get('sort')
    if (sort) {
      const direction = sort.startsWith('-') ? 'desc' : 'asc'
      const columnAccessor = sort.replace('-', '')
      setSortStatus({ columnAccessor, direction })
    } else {
      // default sort
      setSortStatus({ columnAccessor: 'updated_at', direction: 'desc' })
    }
  }, [])

  const onQueryTable = (queryKey: string, queryValue: string | null) => {
    const queryParams = new URLSearchParams(window.location.search)

    if (queryValue === null) queryParams.delete(queryKey)
    else queryParams.set(queryKey, queryValue.toString())

    if (queryKey === 'per_page') queryParams.set('page', '1')

    const payload = Object.fromEntries(queryParams)
    router.get(route(endpoint as any).path as any, payload, { preserveState: true })
  }

  const onSortStatus = ({ columnAccessor, direction }: DataTableSortStatus<T>) => {
    onQueryTable(
      'sort',
      direction === 'asc' ? String(columnAccessor) : `-${String(columnAccessor)}`
    )
    setSortStatus(() => ({ columnAccessor, direction }))
  }

  const doSearch = (q?: string) => {
    setSearch(() => q ?? search)
    onQueryTable('search', q ?? search)
  }

  const debouncedCallback = useDebouncedCallback(({ q }) => {
    doSearch(q)
  }, 500)

  const onSearch = (q: string) => {
    setSearch(() => q)
    debouncedCallback({ q })
  }

  const onPageChange = (page: number) => {
    onQueryTable('page', page.toString())
  }

  const onRecordsPerPage = (page: number) => {
    onQueryTable('per_page', page.toString())
  }

  return {
    isFetching,
    search,
    setSearch,
    doSearch,
    onSearch,
    sortStatus,
    onSortStatus,
    onPageChange,
    onRecordsPerPage,
    onQueryTable,
  }
}
