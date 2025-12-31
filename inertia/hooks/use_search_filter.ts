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
  searchBy: Record<string, string>
  doSearch: (q?: string) => void
  onSearch: (e: string) => void
  onSearchBy: (column: string, value: string) => void
  onPageChange: (e: number) => void
  onRecordsPerPage: (e: number) => void
  onQueryTable: (queryKey: string, queryValue: any) => void
  sortStatus: DataTableSortStatus<T>
  onSortStatus: (e: DataTableSortStatus<T>) => void
}

export default function useSearchFilter<T>(
  endpoint: RouteNameType,
  defaultColumnSort = 'updated_at'
): SearchFilerProps<T> {
  const [search, setSearch] = useState<string>('')
  const [searchBy, setSearchBy] = useState<Record<string, string>>({})
  const [isFetching, setIsFetching] = useState<boolean>(false)
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<T>>({
    columnAccessor: defaultColumnSort,
    direction: 'desc',
  })

  // Listen for Inertia events to toggle loading state
  useEffect(() => {
    const unbindStart = router.on('start', () => setIsFetching(true))
    const unbindFinish = router.on('finish', () => setIsFetching(false))
    return () => {
      unbindStart()
      unbindFinish()
    }
  }, [])

  // Sync state with URL on initial mount
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search)
    setSearch(queryParams.get('search') ?? '')

    // Parse searchBy[column] from URL
    const searchByObj: Record<string, string> = {}
    queryParams.forEach((value, key) => {
      const match = key.match(/^searchBy\[(.*)\]$/)
      if (match) {
        searchByObj[match[1]] = value
      }
    })
    setSearchBy(searchByObj)

    // Handle Sort
    const sort = queryParams.get('sort')
    if (sort) {
      const direction = sort.startsWith('-') ? 'desc' : 'asc'
      const columnAccessor = sort.replace('-', '')
      setSortStatus({ columnAccessor: columnAccessor as any, direction })
    }
  }, [])

  /**
   * Core function to update the URL and trigger the Inertia visit
   */
  const onQueryTable = (queryKey: string, queryValue: any) => {
    const queryParams = new URLSearchParams(window.location.search)

    // Update the specific key
    if (queryValue === null || queryValue === '') {
      queryParams.delete(queryKey)
    } else {
      queryParams.set(queryKey, queryValue.toString())
    }

    // Reset page if filtering or changing page size
    if (queryKey === 'per_page' || queryKey === 'search' || queryKey.startsWith('searchBy')) {
      queryParams.set('page', '1')
    }

    const payload = Object.fromEntries(queryParams)
    router.get(route(endpoint as any).path as any, payload, {
      preserveState: true,
      replace: true, // Prevents flooding history stack
    })
  }

  // --- Handlers ---
  const onSortStatus = ({ columnAccessor, direction }: DataTableSortStatus<T>) => {
    const sortValue = direction === 'asc' ? String(columnAccessor) : `-${String(columnAccessor)}`
    onQueryTable('sort', sortValue)
    setSortStatus({ columnAccessor, direction })
  }

  const doSearch = (q?: string) => {
    const value = q ?? search
    setSearch(value)
    onQueryTable('search', value)
  }

  const debouncedSearch = useDebouncedCallback((q: string) => {
    onQueryTable('search', q)
  }, 500)

  const onSearch = (q: string) => {
    setSearch(q)
    debouncedSearch(q)
  }

  const debouncedSearchBy = useDebouncedCallback((column: string, value: string) => {
    onQueryTable(`searchBy[${column}]`, value)
  }, 500)

  const onSearchBy = (column: string, value: string) => {
    setSearchBy((prev) => ({ ...prev, [column]: value }))
    debouncedSearchBy(column, value)
  }

  const onPageChange = (page: number) => onQueryTable('page', page)
  const onRecordsPerPage = (perPage: number) => onQueryTable('per_page', perPage)

  return {
    isFetching,
    search,
    setSearch,
    searchBy,
    doSearch,
    onSearch,
    onSearchBy,
    sortStatus,
    onSortStatus,
    onPageChange,
    onRecordsPerPage,
    onQueryTable,
  }
}
