'use client'

import { Divider, Flex, NotificationProps, Stack, Text } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconAlertCircle, IconCheck, IconInfoCircle, IconXboxX } from '@tabler/icons-react'

export function NotifyError(title: string, message: string = '', others?: NotificationProps) {
  return notifications.show({
    title,
    message: (
      <Stack gap={4}>
        <Text size="sm" className="whitespace-pre-wrap">
          {message}
        </Text>
        <Flex justify={'left'}>
          <Divider className="hr-error" />
        </Flex>
      </Stack>
    ),
    color: 'red',
    autoClose: 7900,
    icon: <IconXboxX />,
    ...others,
  })
}

export function NotifySuccess(title: string, message: string = '', others?: NotificationProps) {
  return notifications.show({
    title,
    message: (
      <Stack gap={4}>
        <Text size="sm" className="whitespace-pre-wrap">
          {message}
        </Text>
        <Flex justify={'left'}>
          <Divider className="hr-success" />
        </Flex>
      </Stack>
    ),
    color: 'green',
    autoClose: 3900,
    icon: <IconCheck />,
    ...others,
  })
}

export function NotifyInfo(title: string, message: string = '', others?: NotificationProps) {
  return notifications.show({
    title,
    message: (
      <Stack gap={4}>
        <Text size="sm" className="whitespace-pre-wrap">
          {message}
        </Text>
        <Flex justify={'left'}>
          <Divider className="hr-info" />
        </Flex>
      </Stack>
    ),
    color: 'blue',
    autoClose: 4900,
    icon: <IconInfoCircle />,
    ...others,
  })
}

export function NotifyWarning(title: string, message: string = '', others?: NotificationProps) {
  return notifications.show({
    title,
    message: (
      <Stack gap={4}>
        <Text size="sm" className="whitespace-pre-wrap">
          {message}
        </Text>
        <Flex justify={'left'}>
          <Divider className="hr-warning" />
        </Flex>
      </Stack>
    ),
    color: 'yellow',
    autoClose: 5900,
    icon: <IconAlertCircle />,
    ...others,
  })
}
