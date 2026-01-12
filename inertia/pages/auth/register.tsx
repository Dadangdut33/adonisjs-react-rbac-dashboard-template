import { InferPageProps, SharedProps } from '@adonisjs/inertia/types'
import type AuthController from '@app/controllers/auth.controller.ts'
import { router } from '@inertiajs/core'
import { Head } from '@inertiajs/react'
import { route } from '@izzyjs/route/client'
import { Box, Loader, Text } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useLocalStorage } from '@mantine/hooks'
import { Turnstile } from '@marsidev/react-turnstile'
import { IconArrowLeft } from '@tabler/icons-react'
import { useState } from 'react'
import {
  PasswordPopover,
  PasswordStrengthDropdown,
  getPasswordStrength,
} from '~/components/auth/password'
import { useModals } from '~/components/core/modal/modal-hooks'
import { NotifyError } from '~/components/core/notify'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { useGenericMutation } from '~/hooks/use_generic_mutation'
import AuthLayout from '~/layouts/auth'
import { PASS_REGEX } from '~/lib/constants'
import { checkFormWithCaptcha, cn } from '~/lib/utils'

const maxWidth = 'max-w-md'
export default function Page(props: SharedProps & InferPageProps<AuthController, 'viewRegister'>) {
  const [_, setTimeoutVerifEmailStart] = useLocalStorage<null | number>({
    key: 'timeout_verify_email_start',
    defaultValue: null,
  })
  const [__, setIsTimedOutVerifEmail] = useLocalStorage<boolean>({
    key: 'timeout_verify_email',
    defaultValue: false,
  })
  const [___, setIsNewlyRegistered] = useLocalStorage<boolean>({
    key: 'newly_registered',
    defaultValue: true,
  })
  const { ConfirmModal } = useModals()
  const form = useForm({
    initialValues: {
      full_name: '',
      username: '',
      email: '',
      password: '',
      password_confirmation: '',
      cf_token: '',
    },
    validate: {
      full_name: (value) => (value.length > 0 ? null : 'FullName is required'),
      username: (value) => (value.length > 0 ? null : 'Username is required'),
      email: (value) => (value.length > 0 ? null : 'Email is required'),
      password: (value) => (PASS_REGEX.test(value) ? null : 'Password does not meet requirements'),
      password_confirmation: (value) => {
        if (!PASS_REGEX.test(value)) return 'Password does not meet requirements'
        if (value !== form.values.password) return 'Passwords do not match'
        return null
      },
      cf_token: (value) => (value.length > 0 ? null : 'Captcha is required'),
    },
  })

  const mutation = useGenericMutation('POST', route('auth.register.post').path, {
    onError(error, _variables, _context) {
      if (error.response?.data.form_errors) {
        form.setErrors(error.response?.data.form_errors)
      }
    },
    onSuccess() {
      setTimeoutVerifEmailStart(Date.now())
      setIsTimedOutVerifEmail(true)
      setIsNewlyRegistered(true)
    },
  })

  const doMutate = () => {
    if (!checkFormWithCaptcha(form, { bypass_captcha: props.bypass_captcha })) return
    mutation.mutate(form.values)
  }

  const confirm = ConfirmModal({
    message: 'Are you sure you want to register with this data?',
    onConfirm: () => {
      doMutate()
    },
  })

  // ---------------------------
  // Password strength
  const [openPW, setOpenPW] = useState(false)
  const [openPWConfirm, setOpenPWConfirm] = useState(false)

  const password = form.values.password
  const confirmation = form.values.password_confirmation
  const confirmationMatch = password === confirmation

  const strengthPass = getPasswordStrength(password, confirmationMatch, false)
  const strengthPassConfirm = getPasswordStrength(confirmation, confirmationMatch, true)

  return (
    <AuthLayout alertClassName={cn(maxWidth, 'mx-auto px-1')}>
      <Head>
        <title>Register</title>
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

      <div className={cn('flex flex-col gap-4', maxWidth, 'mx-auto')}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Register</CardTitle>
            <CardDescription>Fill the form to register an account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <Input
                label="Full Name"
                id="full_name"
                type="text"
                placeholder="John Smith"
                required
                value={form.values.full_name}
                error={form.errors.full_name}
                onChange={(e) => form.setFieldValue('full_name', e.target.value)}
              />

              <Input
                label="Username"
                id="username"
                type="text"
                placeholder="johnsmith67"
                required
                value={form.values.username}
                error={form.errors.username}
                onChange={(e) => form.setFieldValue('username', e.target.value)}
              />

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

              <PasswordPopover
                input={
                  <Input
                    label="Password"
                    id="password"
                    type="password"
                    placeholder="******"
                    required
                    value={form.values.password}
                    error={form.errors.password}
                    onChange={(e) => form.setFieldValue('password', e.target.value)}
                  />
                }
                popoverOpened={openPW}
                setPopoverOpened={setOpenPW}
                popoverDropdown={
                  <PasswordStrengthDropdown
                    strength={strengthPass}
                    password={password}
                    confirmation={confirmation}
                  />
                }
              />

              <PasswordPopover
                input={
                  <Input
                    label="Password Confirmation"
                    id="password_confirmation"
                    type="password"
                    placeholder="******"
                    required
                    value={form.values.password_confirmation}
                    error={form.errors.password_confirmation}
                    onChange={(e) => form.setFieldValue('password_confirmation', e.target.value)}
                  />
                }
                popoverOpened={openPWConfirm}
                setPopoverOpened={setOpenPWConfirm}
                popoverDropdown={
                  <PasswordStrengthDropdown
                    strength={strengthPassConfirm}
                    password={password}
                    confirmation={confirmation}
                    isConfirmation
                  />
                }
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

              <Button className="w-full" disabled={mutation.isPending} onClick={confirm}>
                {mutation.isPending && <Loader size={16} color="black" />}
                Register
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  )
}
