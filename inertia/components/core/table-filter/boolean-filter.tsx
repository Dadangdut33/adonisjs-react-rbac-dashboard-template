import { Box, Checkbox } from '@mantine/core'

import { TableFilterProps } from './types'

export const FilterBoolean = ({ column, label, description, searchFilter }: TableFilterProps) => (
  <Box py="xs">
    <Checkbox
      label={label}
      description={description}
      checked={searchFilter.searchBy[column] === 'true'}
      onChange={(e) => searchFilter.onSearchBy(column, e.currentTarget.checked ? 'true' : '')}
    />
  </Box>
)
