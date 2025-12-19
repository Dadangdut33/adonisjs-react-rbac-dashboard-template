'use client'

import { createTheme } from '@mantine/core'

export const theme = createTheme({
  fontFamily:
    'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
  headings: {
    fontFamily:
      'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
  },
  primaryColor: 'blue',
  focusRing: 'always',
  radius: { xs: '5px' },
  defaultRadius: 'xs',
})
