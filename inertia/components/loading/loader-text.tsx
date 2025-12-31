'use client'
import { Box, Loader, Title } from '@mantine/core'
import { useRef } from 'react'

export default function TextLoad({
  center_xy = true,
  children,
}: {
  center_xy?: boolean
  children?: React.ReactNode
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  return (
    <Box className={center_xy ? 'fixed inset-0 flex items-center justify-center' : ''}>
      <div className="relative inline-block" ref={containerRef}>
        <div className="absolute top-0 left-0 h-full bg-black dark:bg-white animate-suspense-loader" />
        <Title
          order={2}
          className="relative m-4 whitespace-nowrap mix-blend-difference text-sky-700 dark:text-white"
        >
          {children ?? (
            <div className="flex items-center">
              <Loader size={18} me={'md'} />
              <i>Please Wait...</i>
            </div>
          )}
        </Title>
      </div>
    </Box>
  )
}
