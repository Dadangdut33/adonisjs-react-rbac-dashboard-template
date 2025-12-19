'use client'

import { useMantineColorScheme } from '@mantine/core'
import { Moon, Sun } from 'lucide-react'
import { useEffect } from 'react'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils'

export function ThemeSwitcher({ hidden }: { hidden?: boolean }) {
  const { toggleColorScheme, colorScheme } = useMantineColorScheme()

  // sync to html class
  useEffect(() => {
    document.body.classList.toggle('dark', colorScheme === 'dark')
  }, [colorScheme])

  return (
    <>
      <Button
        className={cn('size-9 p-0 [&_svg]:size-5', hidden && 'hidden')}
        onClick={hidden ? undefined : toggleColorScheme}
        variant={'ghost'}
      >
        <Sun className="hidden dark:inline stroke-foreground" />
        <Moon className="inline dark:hidden stroke-foreground" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    </>
  )
}
