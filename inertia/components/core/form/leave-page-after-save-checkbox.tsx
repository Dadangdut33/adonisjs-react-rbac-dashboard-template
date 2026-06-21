import { Group, SegmentedControl, Text, Tooltip } from '@mantine/core'
import { IconArrowBarToRight, IconDeviceFloppy } from '@tabler/icons-react'

type LeavePageAfterSaveCheckboxProps = {
  checked: boolean
  onChange: (value: boolean) => void
  visible?: boolean
  disabled?: boolean
}

export default function LeavePageAfterSaveCheckbox({
  checked,
  onChange,
  visible = true,
  disabled = false,
}: LeavePageAfterSaveCheckboxProps) {
  if (!visible) return null

  return (
    <Tooltip label="Choose whether saving keeps you on this page or returns to the list.">
      <Group gap={8} wrap="nowrap">
        <Text size="xs" c="dimmed" fw={600}>
          After save
        </Text>
        <SegmentedControl
          size="xs"
          radius="xl"
          disabled={disabled}
          value={checked ? 'leave' : 'stay'}
          onChange={(value) => onChange(value === 'leave')}
          data={[
            {
              value: 'stay',
              label: (
                <Group gap={4} wrap="nowrap">
                  <IconDeviceFloppy size={14} />
                  <span>Stay</span>
                </Group>
              ),
            },
            {
              value: 'leave',
              label: (
                <Group gap={4} wrap="nowrap">
                  <IconArrowBarToRight size={14} />
                  <span>Leave</span>
                </Group>
              ),
            },
          ]}
        />
      </Group>
    </Tooltip>
  )
}
