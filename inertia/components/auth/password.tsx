import { Box, Popover, Progress, Text, rem } from '@mantine/core'
import { IconCheck, IconX } from '@tabler/icons-react'
import { PASS_REQ } from '~/lib/constants'

export default function PasswordRequirement({ meets, label }: { meets: boolean; label: string }) {
  return (
    <Text
      c={meets ? 'teal' : 'red'}
      style={{ display: 'flex', alignItems: 'center' }}
      mt={7}
      size="sm"
    >
      {meets ? (
        <IconCheck style={{ width: rem(14), height: rem(14) }} />
      ) : (
        <IconX style={{ width: rem(14), height: rem(14) }} />
      )}{' '}
      <Box ml={10} component="span">
        {label}
      </Box>
    </Text>
  )
}

const WITH_CONFIRMATION = 1

export function getPasswordStrength(
  password: string,
  confirmationMatch: boolean,
  countConfirmation: boolean = true
) {
  const totalRequirements = PASS_REQ.length + 1 + (countConfirmation ? WITH_CONFIRMATION : 0)

  let fails = password.length > 8 ? 0 : 1

  for (const req of PASS_REQ) {
    if (!req.re.test(password)) fails++
  }

  if (countConfirmation && !confirmationMatch) {
    fails++
  }

  const score = 100 - (100 / totalRequirements) * fails
  return Math.max(score, 10)
}

export function strengthColor(strength: number) {
  if (strength === 100) return 'teal'
  if (strength > 50) return 'yellow'
  return 'red'
}

export function PasswordStrengthDropdown({
  strength,
  isConfirmation,
  password,
  confirmation,
}: {
  strength: number
  isConfirmation?: boolean
  password: string
  confirmation: string
}) {
  return (
    <Popover.Dropdown className="bg-background!">
      <Progress color={strengthColor(strength)} value={strength} size={5} mb="xs" />

      {PASS_REQ.map((r, i) => (
        <PasswordRequirement
          key={i}
          label={r.label}
          meets={r.re.test(isConfirmation ? confirmation : password)}
        />
      ))}

      {isConfirmation && (
        <PasswordRequirement
          label="Password matches confirmation"
          meets={password.length > 0 && password === confirmation}
        />
      )}
    </Popover.Dropdown>
  )
}

export function PasswordPopover({
  input,
  popoverOpened,
  setPopoverOpened,
  popoverDropdown,
}: {
  input: React.ReactNode
  popoverOpened: boolean
  setPopoverOpened: (value: boolean) => void
  popoverDropdown: React.ReactNode
}) {
  return (
    <Popover
      opened={popoverOpened}
      position="bottom"
      width="target"
      transitionProps={{ transition: 'pop' }}
    >
      <Popover.Target>
        <div
          onFocusCapture={() => setPopoverOpened(true)}
          onBlurCapture={() => setPopoverOpened(false)}
          className="space-y-4 flex flex-col"
        >
          {input}
        </div>
      </Popover.Target>
      {popoverDropdown}
    </Popover>
  )
}
