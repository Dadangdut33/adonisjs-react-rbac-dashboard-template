import { InferPageProps, SharedProps } from '@adonisjs/inertia/types'
import type AuthController from '@app/controllers/auth.controller.ts'
import { router } from '@inertiajs/core'
import { Head } from '@inertiajs/react'
import { route } from '@izzyjs/route/client'
import { Box, Loader, Text } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useInterval, useLocalStorage, useTimeout } from '@mantine/hooks'
import { Turnstile } from '@marsidev/react-turnstile'
import { IconArrowLeft, IconTimeDuration30 } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { useModals } from '~/components/core/modal-hooks'
import { NotifyError } from '~/components/core/notify'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { useGenericMutation } from '~/hooks/use_generic_mutation'
import { useIsReady } from '~/hooks/use_is_ready'
import AuthLayout from '~/layouts/auth'
import { TIMEOUT_NORMAL } from '~/lib/constants'
import { checkForm, cn } from '~/lib/utils'

export default function Page(
  props: SharedProps & InferPageProps<AuthController, 'viewRequestResetPassword'>
) {
  const [isTimedOut, setIsTimedOut] = useLocalStorage({
    key: 'reset_password_request_timed_out',
    defaultValue: false,
  })
  const [timedOutStartTime, setTimedOutStartTime] = useLocalStorage<number | null>({
    key: 'reset_password_request_timed_out_start',
    defaultValue: null,
  })
  const { start: startTimeout, clear: clearTimeout } = useTimeout(() => {
    setIsTimedOut(false)
    setTimedOutStartTime(null)
  }, TIMEOUT_NORMAL)
  const { ConfirmModal } = useModals()
  const isReady = useIsReady()
  const [timerMs, setTimerMs] = useState(TIMEOUT_NORMAL)

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
      email: '',
      cf_token: '',
    },

    validate: {
      email: (value) => (value.length > 0 ? null : 'Email is required'),
      cf_token: (value) => (value.length > 0 ? null : 'Captcha is required'),
    },
  })
  const mutation = useGenericMutation('POST', route('auth.requestResetPassword.post').path, {
    onError(error, _variables, _context) {
      if (error.response?.data.form_errors) {
        form.setErrors(error.response?.data.form_errors)
      }
      clearTimeout()
    },
    onSuccess() {
      setIsTimedOut(true)
      setTimedOutStartTime(Date.now())
      interval.start()
      startTimeout()
      form.reset()
    },
  })
  const doMutate = () => {
    if (!checkForm(form, { bypass_captcha: props.bypass_captcha })) return
    if (isTimedOut)
      return NotifyError('Error', 'Please wait until you can request another password reset email.')

    mutation.mutate(form.values)
  }

  // on first load, check if timed out
  useEffect(() => {
    if (!isReady) return

    if (isTimedOut) {
      // calculate remaining time
      if (timedOutStartTime) {
        const elapsedMs = Date.now() - timedOutStartTime
        const remainingMs = TIMEOUT_NORMAL - elapsedMs
        setTimerMs(remainingMs)

        interval.start()
        setIsTimedOut(true) // start but dont update timed out start
        startTimeout()
      } else {
        setIsTimedOut(false)
      }
    }
  }, [isReady])

  const confirm = ConfirmModal({
    message: 'Are you sure you want to request a password reset?',
    onConfirm: () => {
      doMutate()
    },
  })

  return (
    <AuthLayout>
      <Head>
        <title>Request Password Reset</title>
      </Head>

      <Box pos={'absolute'} top={10} left={10}>
        <Button
          disabled={mutation.isPending}
          onClick={() => {
            router.visit(route('auth.login').path)
          }}
        >
          {mutation.isPending ? <Loader size={16} color="black" /> : <IconArrowLeft stroke={2} />}
          Back to Login
        </Button>
      </Box>

      <div className={cn('flex flex-col gap-4 max-w-md mx-auto')}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Request Password Reset</CardTitle>
            <CardDescription>Fill the form to request password reset</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-4">
                <Input
                  label="Email"
                  id="email"
                  type="email"
                  placeholder="mail@example.com"
                  required
                  value={form.values.email}
                  error={form.errors.email}
                  onChange={(e) => form.setFieldValue('email', e.target.value)}
                />

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
                {props.site_key && !props.bypass_captcha && (
                  <Turnstile
                    className="mx-auto"
                    siteKey={props.site_key}
                    onSuccess={(cf_token) => form.setFieldValue('cf_token', cf_token)}
                    onExpire={() => {
                      form.setFieldValue('cf_token', '')
                    }}
                    onError={() => NotifyError('Error', 'Failed to load captcha')}
                  />
                )}

                <Button
                  className="w-full"
                  disabled={mutation.isPending || isTimedOut}
                  onClick={confirm}
                >
                  {mutation.isPending && <Loader size={16} color="black" />}
                  {isTimedOut ? (
                    <>
                      <IconTimeDuration30 />
                      Please wait for {Math.ceil(timerMs / 1000)} seconds
                    </>
                  ) : (
                    <>Request Password Reset</>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  )
}
