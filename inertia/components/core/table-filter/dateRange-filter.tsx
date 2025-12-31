import { Button, Stack } from '@mantine/core'
import { DatePicker } from '@mantine/dates'

import { TableFilterProps } from './types'

export const FilterDateRange = ({ column, searchFilter, close }: TableFilterProps) => {
  const rawValue = searchFilter.searchBy[column]
  const value: [Date | null, Date | null] = rawValue
    ? (rawValue.split(',').map((d: string) => new Date(d)) as [Date, Date])
    : [null, null]

  return (
    <Stack p="xs">
      <DatePicker
        type="range"
        allowSingleDateInRange
        value={value}
        onChange={(range) => {
          if (range[0] && range[1]) {
            // Format as YYYY-MM-DD for cleaner URLs
            const start = range[0].toString().split('T')[0]
            const end = range[1].toString().split('T')[0]
            searchFilter.onSearchBy(column, `${start},${end}`)
          } else if (!range[0] && !range[1]) {
            searchFilter.onSearchBy(column, '')
          }
        }}
      />
      <Button
        variant="light"
        size="xs"
        fullWidth
        onClick={() => {
          searchFilter.onSearchBy(column, '')
          close && close()
        }}
      >
        Clear Filter
      </Button>
    </Stack>
  )
}
