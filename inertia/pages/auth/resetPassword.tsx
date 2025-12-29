import { InferPageProps, SharedProps } from '@adonisjs/inertia/types'
import type AuthController from '@app/controllers/auth.controller.ts'
import { Head } from '@inertiajs/react'
import { route } from '@izzyjs/route/client'
import { Loader, Text } from '@mantine/core'
import { useForm } from '@mantine/form'
import { Turnstile } from '@marsidev/react-turnstile'
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

export default function Page(
  props: SharedProps & InferPageProps<AuthController, 'viewResetPassword'>
) {
  const form = useForm({
    initialValues: {
      email: props.email,
      password: '',
      password_confirmation: '',
      token: props.token,
      cf_token: '',
    },
    validate: {
      email: (value) => (value.length > 0 ? null : 'Email is required'),
      password: (value) => (PASS_REGEX.test(value) ? null : 'Password does not meet requirements'),
      password_confirmation: (value) => {
        if (!PASS_REGEX.test(value)) return 'Password does not meet requirements'
        if (value !== form.values.password) return 'Passwords do not match'
        return null
      },
      token: (value) => (value.length > 0 ? null : 'Token is required'),
      cf_token: (value) => (value.length > 0 ? null : 'Captcha is required'),
    },
  })
  const { ConfirmModal } = useModals()
  const mutation = useGenericMutation('POST', route('auth.resetPassword.post').path, {
    onError(error, _variables, _context) {
      if (error.response?.data.form_errors) {
        form.setErrors(error.response?.data.form_errors)
      }
    },
  })
  const doMutate = () => {
    if (!checkFormWithCaptcha(form, { bypass_captcha: props.bypass_captcha })) return
    mutation.mutate(form.values)
  }

  const confirm = ConfirmModal({
    message: 'Are you sure you want to reset your password?',
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
    <AuthLayout>
      <Head>
        <title>Reset Password</title>
      </Head>

      <div className={cn('flex flex-col gap-4')}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Reset Password</CardTitle>
            <CardDescription>Fill the form to Reset Password</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <Input
                label="Email"
                id="email"
                type="email"
                placeholder="mail@example.com"
                required
                value={form.values.email}
                error={form.errors.email}
                // cannot be changed
                // onChange={(e) => form.setFieldValue('email', e.target.value)}
                readOnly
                disabled
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
                Reset Password
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  )
}
