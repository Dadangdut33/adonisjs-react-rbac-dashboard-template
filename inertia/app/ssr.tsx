import { createInertiaApp } from '@inertiajs/react'
import { ColorSchemeScript, MantineProvider } from '@mantine/core'
import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/dropzone/styles.css'
import '@mantine/notifications/styles.css'
import { NavigationProgress } from '@mantine/nprogress'
import '@mantine/nprogress/styles.css'
import 'mantine-datatable/styles.layer.css'
import ReactDOMServer from 'react-dom/server'
import AppProvider from '~/components/provider'
import '~/css/app.css'
import { theme } from '~/theme'

const appName = import.meta.env.VITE_APP_NAME || 'AdonisJS'

export default function render(page: any) {
  return createInertiaApp({
    page,
    title: (title) => (title ? `${title} - ${appName}` : appName),
    render: ReactDOMServer.renderToString,
    resolve: (name) => {
      const pages = import.meta.glob('../pages/**/*.tsx', { eager: true })
      return pages[`../pages/${name}.tsx`]
    },
    setup: ({ App, props }) => {
      return (
        <MantineProvider theme={theme}>
          <ColorSchemeScript />
          <NavigationProgress />
          <AppProvider>
            <App {...props} />
          </AppProvider>
        </MantineProvider>
      )
    },
  })
}
