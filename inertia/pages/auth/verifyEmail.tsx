import { InferPageProps, SharedProps } from '@adonisjs/inertia/types'
import type AuthController from '@app/controllers/auth.controller.ts'
import { Head } from '@inertiajs/react'
import { route } from '@izzyjs/route/client'
import { Alert, Group, Loader, Text } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useInterval, useLocalStorage, useTimeout } from '@mantine/hooks'
import { Turnstile } from '@marsidev/react-turnstile'
import { IconMessageCircle, IconTimeDuration30 } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { useModals } from '~/components/core/modal-hooks'
import { NotifyError } from '~/components/core/notify'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  cardClass,
} from '~/components/ui/card'
import { useGenericMutation } from '~/hooks/use_generic_mutation'
import { useIsReady } from '~/hooks/use_is_ready'
import { useLogout } from '~/hooks/use_logout'
import AuthLayout from '~/layouts/auth'
import { TIMEOUT_SHORT } from '~/lib/constants'
import { checkFormWithCaptcha, cn } from '~/lib/utils'

export default function Page(
  props: SharedProps & InferPageProps<AuthController, 'viewVerifyEmail'>
) {
  const [isTimedOut, setIsTimedOut] = useLocalStorage({
    key: 'timeout_verify_email',
    defaultValue: false,
  })
  const [timedOutStartTime, setTimedOutStartTime] = useLocalStorage<null | number>({
    key: 'timeout_verify_email_start',
    defaultValue: null,
  })
  const [isNewlyRegistered, setIsNewlyRegistered] = useLocalStorage<boolean>({
    key: 'newly_registered',
    defaultValue: true,
  })
  const isReady = useIsReady()
  const { start: startTimeout, clear: clearTimeout } = useTimeout(() => {
    setIsTimedOut(false)
    setTimedOutStartTime(null)
  }, TIMEOUT_SHORT)
  const [timerMs, setTimerMs] = useState(TIMEOUT_SHORT)

  const interval = useInterval(() => {
    if (timerMs <= 0) {
      setIsTimedOut(false)
      setTimedOutStartTime(null)
      interval.stop()
    } else {
      setTimerMs((s) => s - 1000)
    }
  }, 1000)

  const form = useForm({
    initialValues: {
      email: props.user?.email,
      cf_token: '',
    },

    validate: {
      email: (value) =>
        value
          ? value.length > 0
            ? null
            : 'Email is required'
          : 'EMAIL_REQUIRED. THIS ERROR SHOULD NOT HAPPEN',
      cf_token: (value) => (value.length > 0 ? null : 'Captcha is required'),
    },
  })
  const mutation = useGenericMutation('POST', route('auth.verifyEmail.request').path, {
    onError(error, _variables, _context) {
      if (error.response?.data.form_errors) {
        form.setErrors(error.response?.data.form_errors)
      }
      clearTimeout()
    },
    onSuccess() {
      interval.start()
      setIsTimedOut(true)
      setTimedOutStartTime(Date.now())
      startTimeout()
      form.reset()
    },
  })
  const doMutate = () => {
    if (!checkFormWithCaptcha(form, { bypass_captcha: props.bypass_captcha })) return
    if (isTimedOut)
      return NotifyError('Error', 'Please wait until you can request another email verification.')

    mutation.mutate(form.values)
  }

  // ---------------------------
  // Timeout
  // ---------------------------
  // on first load, check if timed out
  useEffect(() => {
    if (!isReady) return

    if (isTimedOut) {
      // calculate remaining time
      if (timedOutStartTime) {
        const elapsedMs = Date.now() - timedOutStartTime
        const remainingMs = TIMEOUT_SHORT - elapsedMs
        setTimerMs(remainingMs)

        interval.start()
        setIsTimedOut(true) // start but dont update timed out start
        startTimeout()
      } else {
        setIsTimedOut(false)
      }
    }
  }, [isReady])

  const { ConfirmLogoutModal, ConfirmModal } = useModals()
  const { mutate: logout } = useLogout()
  const confirm = ConfirmModal({
    message: 'Are you sure you want to resend the verification email?',
    onConfirm: () => {
      doMutate()

      // once user have interacted, we reset newly registered flag
      if (isNewlyRegistered) setIsNewlyRegistered(false)
    },
  })
  const confirmLogout = ConfirmLogoutModal({
    onConfirm: () => {
      logout()
    },
  })

  return (
    <AuthLayout>
      <Head>
        <title>Verify Email</title>
      </Head>

      <div className={cn('flex flex-col gap-4')}>
        {isTimedOut && (
          <Alert
            title="Notice"
            color="blue"
            icon={<IconMessageCircle />}
            mt={'md'}
            className={cardClass}
          >
            {isNewlyRegistered ? (
              <>
                Email verification has been sent to your email address. Please check your email and
                click the verification link that we sent to you to continue using our services.
              </>
            ) : (
              <>
                You have requested to resend the verification email, please wait a moment before
                resending.
              </>
            )}
          </Alert>
        )}

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Verify Email</CardTitle>
            <CardDescription>
              We have sent a verification email to your email address. <br /> Please check your
              email and click on the verification link to continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 mt-4">
              {props.site_key && !props.bypass_captcha && (
                <>
                  <Turnstile
                    className="mx-auto"
                    siteKey={props.site_key}
                    onSuccess={(cf_token) => form.setFieldValue('cf_token', cf_token)}
                    onExpire={() => {
                      form.setFieldValue('cf_token', '')
                    }}
                    onError={() => NotifyError('Error', 'Failed to load captcha')}
                  />
                  <Text size="xs" mt="xs" color="red" className="text-center">
                    {form.errors.cf_token}
                  </Text>
                </>
              )}

              <Group justify="space-between">
                <Button disabled={mutation.isPending || isTimedOut} onClick={() => confirm()}>
                  {mutation.isPending && <Loader size={16} color="black" />}
                  {isTimedOut ? (
                    <>
                      <IconTimeDuration30 />
                      Please wait for {Math.ceil(timerMs / 1000)} seconds
                    </>
                  ) : (
                    <>Request Verification</>
                  )}
                </Button>

                {/* logout btn */}
                <Button
                  disabled={mutation.isPending}
                  onClick={() => confirmLogout()}
                  className="bg-red-400"
                >
                  Logout
                </Button>
              </Group>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  )
}
