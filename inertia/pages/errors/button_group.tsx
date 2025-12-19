import { router } from '@inertiajs/core'
import { Group } from '@mantine/core'
import { IconArrowLeft, IconHome2 } from '@tabler/icons-react'
import { ThemeSwitcher } from '~/components/core/theme-switcher'
import { Button } from '~/components/ui/button'

export default function ButtonGroup() {
  return (
    <Group justify="center" mt="md">
      <Button onClick={() => window.history.back()}>
        <IconArrowLeft />
        Go Back
      </Button>
      <Button variant="neutral" onClick={() => router.visit('/')}>
        <IconHome2 />
        Back to Home
      </Button>
      <ThemeSwitcher />
    </Group>
  )
}
