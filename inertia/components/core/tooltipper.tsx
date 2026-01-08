import { Tooltip } from '@mantine/core'

export function TooltipIfTrue({
  children,
  isTrue,
  label,
}: {
  children: React.ReactNode
  isTrue: boolean
  label: string
}) {
  if (isTrue) {
    return (
      <Tooltip label={label} withArrow>
        {children}
      </Tooltip>
    )
  }

  return <>{children}</>
}
