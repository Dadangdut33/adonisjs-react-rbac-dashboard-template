import { FlashAlertType } from '#types/app'

import { Alert, AlertProps, MantineSpacing, Stack, StyleProp } from '@mantine/core'
import { useTimeout } from '@mantine/hooks'
import {
  IconAlertTriangle,
  IconMessageCircle,
  IconProgressCheck,
  IconXboxX,
} from '@tabler/icons-react'
import { cx } from 'class-variance-authority'
import { useEffect, useState } from 'react'
import { cardClass } from '~/components/ui/card'

import classes from './flash.module.css'

const useHiddenState = (show: boolean) => {
  const [hidden, setHidden] = useState(false)
  const { start: startHidden, clear: clearHidden } = useTimeout(() => setHidden(true), 500)
  const { start: startVisible, clear: clearVisible } = useTimeout(() => setHidden(false), 500)
  useEffect(() => {
    if (!show) startHidden()
    if (show) startVisible()
    return () => {
      clearHidden()
      clearVisible()
    }
  }, [show])

  return hidden
}

const SuccessAlert = ({
  state,
  show,
  closeFn,
  ...others
}: {
  state: FlashAlertType
  show: boolean
  closeFn: () => void
  others?: AlertProps
}) => {
  const { style: customStyle, ...customProp } = others.others ?? {}
  const hidden = useHiddenState(show)
  return (
    <Alert
      color="green"
      title="Success"
      variant="filled"
      icon={<IconProgressCheck />}
      style={{ whiteSpace: 'pre-wrap' }}
      {...customProp}
      withCloseButton
      onClose={closeFn}
      className={cx(
        {
          [classes.showAnimation]: show,
          [classes.hideAnimation]: !show,
        },
        cardClass
      )}
      display={hidden ? 'none' : 'block'}
    >
      {state.success}
    </Alert>
  )
}

const ErrorAlert = ({
  state,
  show,
  closeFn,
  ...others
}: {
  state: FlashAlertType
  show: boolean
  closeFn: () => void
  others?: AlertProps
}) => {
  const { style: customStyle, ...customProp } = others.others ?? {}
  const hidden = useHiddenState(show)
  return (
    <Alert
      color="#ff4d50"
      title="Error"
      variant="filled"
      icon={<IconXboxX />}
      style={{ whiteSpace: 'pre-wrap' }}
      {...customProp}
      withCloseButton
      onClose={closeFn}
      className={cx(
        {
          [classes.showAnimation]: show,
          [classes.hideAnimation]: !show,
        },
        cardClass
      )}
      display={hidden ? 'none' : 'block'}
    >
      {state.error}
    </Alert>
  )
}

const WarningAlert = ({
  state,
  show,
  closeFn,
  ...others
}: {
  state: FlashAlertType
  show: boolean
  closeFn: () => void
  others?: AlertProps
}) => {
  const { style: customStyle, ...customProp } = others.others ?? {}
  const hidden = useHiddenState(show)
  return (
    <Alert
      color="orange"
      title="Warning"
      variant="filled"
      icon={<IconAlertTriangle />}
      style={{ whiteSpace: 'pre-wrap' }}
      {...customProp}
      withCloseButton
      onClose={closeFn}
      className={cx(
        {
          [classes.showAnimation]: show,
          [classes.hideAnimation]: !show,
        },
        cardClass
      )}
      display={hidden ? 'none' : 'block'}
    >
      {state.warning}
    </Alert>
  )
}

const InfoAlert = ({
  state,
  show,
  closeFn,
  ...others
}: {
  state: FlashAlertType
  show: boolean
  closeFn: () => void
  others?: AlertProps
}) => {
  const { style: customStyle, ...customProp } = others.others ?? {}
  return (
    <Alert
      color="blue"
      title="Information"
      variant="filled"
      icon={<IconMessageCircle />}
      style={{ whiteSpace: 'pre-wrap' }}
      {...customProp}
      withCloseButton
      onClose={closeFn}
      className={cx(
        {
          [classes.showAnimation]: show,
          [classes.hideAnimation]: !show,
        },
        cardClass
      )}
    >
      {state.info}
    </Alert>
  )
}

export default function FlashAlert({
  state,
  mb = 'md',
  mt,
  ...others
}: {
  state: FlashAlertType
  mb?: StyleProp<MantineSpacing>
  mt?: StyleProp<MantineSpacing>
  others?: AlertProps
}) {
  const [showSuccess, setShowSuccess] = useState(true)
  const [showError, setShowError] = useState(true)
  const [showWarning, setShowWarning] = useState(true)
  const [showInfo, setShowInfo] = useState(true)
  const atLeastOneAlert = state.success || state.error || state.warning || state.info

  // reset open state on change
  useEffect(() => {
    setShowSuccess(true)
    setShowError(true)
    setShowWarning(true)
    setShowInfo(true)
  }, [state])

  if (!atLeastOneAlert) return null
  return (
    <Stack gap="md" mb={mb} mt={mt} px="md">
      {state.success && (
        <SuccessAlert
          state={state}
          {...others}
          closeFn={() => setShowSuccess(false)}
          show={showSuccess}
        />
      )}
      {state.error && (
        <ErrorAlert
          state={state}
          {...others}
          closeFn={() => setShowError(false)}
          show={showError}
        />
      )}
      {state.warning && (
        <WarningAlert
          state={state}
          {...others}
          closeFn={() => setShowWarning(false)}
          show={showWarning}
        />
      )}
      {state.info && (
        <InfoAlert state={state} {...others} closeFn={() => setShowInfo(false)} show={showInfo} />
      )}
    </Stack>
  )
}
