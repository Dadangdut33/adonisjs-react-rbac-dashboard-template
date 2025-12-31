import { ActionIcon, TextInput } from '@mantine/core'
import { IconSearch, IconX } from '@tabler/icons-react'

import { TableFilterProps } from './types'

export const FilterText = ({ column, label, description, searchFilter }: TableFilterProps) => (
  <TextInput
    label={label}
    description={description}
    placeholder="Search..."
    leftSection={<IconSearch size={16} />}
    value={searchFilter.searchBy[column] ?? ''}
    onChange={(e) => searchFilter.onSearchBy(column, e.currentTarget.value)}
    rightSection={
      searchFilter.searchBy[column] && (
        <ActionIcon
          size="sm"
          variant="transparent"
          c="dimmed"
          onClick={() => searchFilter.onSearchBy(column, '')}
        >
          <IconX size={14} />
        </ActionIcon>
      )
    }
  />
)
