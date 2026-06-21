import { Box } from '@mantine/core'
import { useId } from 'react'
import { cn } from '~/lib/utils'

type DotsProps = React.SVGProps<SVGSVGElement> & {
  width?: number
  height?: number
  x?: number
  y?: number
  cx?: number
  cy?: number
  cr?: number
  className?: string
}

export function Dots({
  width = 16,
  height = 16,
  x = 0,
  y = 0,
  cx = 1,
  cy = 1,
  cr = 1,
  className,
  ...props
}: DotsProps) {
  const id = useId()

  return (
    <svg
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 h-full w-full fill-neutral-400/80',
        className
      )}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          patternContentUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <circle id="pattern-circle" cx={cx} cy={cy} r={cr} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
    </svg>
  )
}

export default function DotPattern({
  children,
  classname,
}: {
  children: React.ReactNode
  classname?: string
}) {
  return (
    <Box
      className={cn(
        `relative flex items-center justify-center overflow-hidden border-2 mb-5 border-border
        dark:border-darkBorder bg-white dark:bg-slate-900
        shadow-light dark:shadow-dark [background-size:16px_16px] m750:px-5 m750:py-10`,
        classname
      )}
    >
      <div className="z-10 whitespace-pre-wrap text-center text-5xl font-medium tracking-tighter text-black dark:text-white">
        {children}
      </div>
      <Dots
        width={15}
        height={15}
        cx={1}
        cy={1}
        cr={1}
        className={cn('[mask-image:radial-gradient(300px_circle_at_center,white,transparent)]')}
      />
    </Box>
  )
}
