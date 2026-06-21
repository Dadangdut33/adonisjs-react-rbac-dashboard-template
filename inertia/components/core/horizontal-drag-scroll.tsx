import { cn } from '~/lib/utils'
import type React from 'react'
import { useRef, useState } from 'react'

type HorizontalDragScrollProps = {
  className?: string
  children: React.ReactNode
}

export default function HorizontalDragScroll({ className, children }: HorizontalDragScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartXRef = useRef(0)
  const scrollLeftStartRef = useRef(0)

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    setIsDragging(true)
    dragStartXRef.current = e.clientX
    scrollLeftStartRef.current = containerRef.current.scrollLeft
  }

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return
    e.preventDefault()
    const delta = e.clientX - dragStartXRef.current
    containerRef.current.scrollLeft = scrollLeftStartRef.current - delta
  }

  const stopDragging = () => {
    setIsDragging(false)
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'horizontal-drag-scroll overflow-x-auto overflow-y-hidden whitespace-nowrap touch-pan-x select-none',
        isDragging ? 'cursor-grabbing' : 'cursor-grab',
        className
      )}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={stopDragging}
      onMouseLeave={stopDragging}
    >
      {children}
    </div>
  )
}
