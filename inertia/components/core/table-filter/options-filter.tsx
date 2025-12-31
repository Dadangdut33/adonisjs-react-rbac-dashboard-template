import { MultiSelect } from '@mantine/core'
import { IconSearch } from '@tabler/icons-react'

import { TableFilterProps } from './types'

interface FilterOptionsProps extends TableFilterProps {
  data: { value: string; label: string }[] | string[]
}

export const FilterOptions = ({
  column,
  label,
  description,
  data,
  searchFilter,
}: FilterOptionsProps) => (
  <MultiSelect
    label={label}
    description={description}
    data={data}
    placeholder="Select options..."
    searchable
    clearable
    leftSection={<IconSearch size={16} />}
    value={searchFilter.searchBy[column] ? searchFilter.searchBy[column].split(',') : []}
    onChange={(values) => searchFilter.onSearchBy(column, values.join(','))}
    comboboxProps={{ withinPortal: false }}
  />
)
