import { DatePickerInput } from '@mantine/dates'
import { IconCalendar } from '@tabler/icons-react'

import { TableFilterProps } from './types'

export const FilterDate = ({ column, label, description, searchFilter }: TableFilterProps) => {
  const rawValue = searchFilter.searchBy[column]
  const value = rawValue ? new Date(rawValue) : null

  return (
    <DatePickerInput
      label={label}
      description={description}
      placeholder="Pick date"
      leftSection={<IconCalendar size={16} />}
      clearable
      value={value}
      onChange={(date) => {
        const formattedDate = date ? date.toString().split('T')[0] : ''
        searchFilter.onSearchBy(column, formattedDate)
      }}
      // ensures the calendar stays inside the filter popover
      popoverProps={{ withinPortal: false }}
    />
  )
}
