/// <reference path="../../adonisrc.ts" />
/// <reference path="../../config/inertia.ts" />
import { resolvePageComponent } from '@adonisjs/inertia/helpers'
import { createInertiaApp } from '@inertiajs/react'
import { ColorSchemeScript, MantineProvider } from '@mantine/core'
import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/dropzone/styles.css'
import '@mantine/notifications/styles.css'
import { NavigationProgress } from '@mantine/nprogress'
import '@mantine/nprogress/styles.css'
import 'mantine-datatable/styles.layer.css'
import { createRoot, hydrateRoot } from 'react-dom/client'
import AppProvider from '~/components/provider'
import '~/css/app.css'
import { theme } from '~/theme'

const appName = import.meta.env.VITE_APP_NAME || 'AdonisJS'

createInertiaApp({
  progress: { color: '#5468FF' },
  title: (title) => (title ? `${title} - ${appName}` : appName),
  resolve: (name) => {
    return resolvePageComponent(`../pages/${name}.tsx`, import.meta.glob('../pages/**/*.tsx'))
  },

  setup({ el, App, props }) {
    const comp = (
      <MantineProvider theme={theme}>
        <ColorSchemeScript defaultColorScheme="dark" />
        <NavigationProgress />
        <AppProvider>
          <App {...props} />
        </AppProvider>
      </MantineProvider>
    )

    if (import.meta.env.DEV) {
      createRoot(el).render(comp)
      return
    }

    hydrateRoot(el, comp)
  },
})
