'use client'

import { Box, Title } from '@mantine/core'
import { motion, useAnimate } from 'framer-motion'
import { useEffect, useRef } from 'react'

export default function TextLoad({
  center_xy = true,
  children,
}: {
  center_xy?: boolean
  children?: React.ReactNode
}) {
  const [scope, animate] = useAnimate()

  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const containerWidth = containerRef.current?.offsetWidth
    const animateLoader = async () => {
      await animate(
        [
          [scope.current, { x: 0, width: '100%' }],
          [scope.current, { x: containerWidth, width: '0%' }, { delay: 0.6 }],
        ],
        {
          duration: 2,
          repeat: Infinity,
          repeatDelay: 0.8,
        }
      )
    }
    animateLoader()
  }, [])

  return (
    <Box className={center_xy ? 'flex items-center justify-center h-full' : ''}>
      <div className="relative" ref={containerRef}>
        <motion.div ref={scope} className="absolute h-full bg-black dark:bg-white " />
        <Title
          order={2}
          className="m-4 whitespace-nowrap mix-blend-difference text-sky-700 dark:text-white"
        >
          {children ?? (
            <div className="flex items-center justify-center h-screen">
              <i>Please Wait...</i>
            </div>
          )}
        </Title>
      </div>
    </Box>
  )
}
