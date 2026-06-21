import { Collapse, Paper, TextInput } from '@mantine/core'

type DashboardSearchPanelProps = {
  opened: boolean
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function DashboardSearchPanel({
  opened,
  value,
  onChange,
  placeholder = 'Search...',
}: DashboardSearchPanelProps) {
  return (
    <Collapse in={opened} transitionDuration={220} transitionTimingFunction="ease">
      <Paper
        p="md"
        withBorder
        style={{
          opacity: opened ? 1 : 0,
          transform: opened ? 'translateY(0)' : 'translateY(-6px)',
          transition: 'opacity 180ms ease, transform 180ms ease',
        }}
      >
        <TextInput
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)}
          placeholder={placeholder}
        />
      </Paper>
    </Collapse>
  )
}
