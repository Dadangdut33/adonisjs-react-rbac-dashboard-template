'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Suspense } from 'react'
import TextLoad from '~/components/loading/loader-text'
import { Toaster } from '~/components/ui/sonner'

import { ModalProvider } from '../core/modal/modal-context'
import { ThemeSwitcher } from '../core/theme-switcher'
import LoadingIndicator from '../loading/loading-indicator'

const queryClient = new QueryClient()

export default function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<TextLoad />}>
        <LoadingIndicator />
        {/* notification toaster */}
        <Toaster />
        {/* Hidden theme switcher */}
        <ThemeSwitcher hidden />
        {/* Wrapped in Modal provider */}
        <ModalProvider>{children}</ModalProvider>
      </Suspense>
    </QueryClientProvider>
  )
}
