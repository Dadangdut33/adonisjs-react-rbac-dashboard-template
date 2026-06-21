'use client'

import { TuyauProvider } from '@adonisjs/inertia/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Suspense } from 'react'
import TextLoad from '~/components/loading/loader-text'
import { Toaster } from '~/components/ui/sonner'
import { tuyauClient } from '~/lib/client'

import { ModalProvider } from '../core/modal/modal-context'
import { ThemeSwitcher } from '../core/theme-switcher'
import { TooltipProvider } from '../ui/tooltip'

const queryClient = new QueryClient()

export default function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <TuyauProvider client={tuyauClient}>
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<TextLoad />}>
          {/* notification toaster */}
          <Toaster />
          {/* Hidden theme switcher */}
          <ThemeSwitcher hidden />
          {/* Wrapped in Modal provider */}
          <ModalProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </ModalProvider>
        </Suspense>
      </QueryClientProvider>
    </TuyauProvider>
  )
}
