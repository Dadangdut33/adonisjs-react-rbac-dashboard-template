import { createInertiaApp } from '@inertiajs/react'
import { ColorSchemeScript, MantineProvider } from '@mantine/core'
import { NavigationProgress } from '@mantine/nprogress'
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
