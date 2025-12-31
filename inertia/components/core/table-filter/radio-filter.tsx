import { ActionIcon, Group, Radio, Stack } from '@mantine/core'
import { IconX } from '@tabler/icons-react'

import { TableFilterProps } from './types'

interface FilterRadioProps extends TableFilterProps {
  data: { value: string; label: string }[]
}

export const FilterRadio = ({
  column,
  label,
  description,
  data,
  searchFilter,
}: FilterRadioProps) => (
  <Radio.Group
    label={label}
    description={description}
    value={searchFilter.searchBy[column] ?? ''}
    onChange={(val) => searchFilter.onSearchBy(column, val)}
  >
    <Stack gap="xs" mt="xs">
      {data.map((item) => (
        <Group key={item.value} justify="space-between" wrap="nowrap">
          <Radio value={item.value} label={item.label} />
          {searchFilter.searchBy[column] === item.value && (
            <ActionIcon
              variant="transparent"
              color="gray"
              size="xs"
              onClick={() => searchFilter.onSearchBy(column, '')}
            >
              <IconX size={12} />
            </ActionIcon>
          )}
        </Group>
      ))}
    </Stack>
  </Radio.Group>
)
