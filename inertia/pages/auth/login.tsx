import { InferPageProps, SharedProps } from '@adonisjs/inertia/types'
import type AuthController from '@app/controllers/auth.controller.ts'
import { router } from '@inertiajs/core'
import { Head, Link } from '@inertiajs/react'
import { route } from '@izzyjs/route/client'
import { Box, Loader, Text } from '@mantine/core'
import { useForm } from '@mantine/form'
import { Turnstile } from '@marsidev/react-turnstile'
import { IconArrowLeft } from '@tabler/icons-react'
import { NotifyError } from '~/components/core/notify'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { useGenericMutation } from '~/hooks/use_generic_mutation'
import AuthLayout from '~/layouts/auth'
import { checkFormWithCaptcha, cn } from '~/lib/utils'

export default function Page(props: SharedProps & InferPageProps<AuthController, 'viewLogin'>) {
  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      cf_token: '',
    },
    validate: {
      email: (value) => (value.length > 0 ? null : 'Email is required'),
      password: (value) => (value.length > 0 ? null : 'Password is required'),
      cf_token: (value) => (value.length > 0 ? null : 'Captcha is required'),
    },
  })

  const mutation = useGenericMutation('POST', route('auth.login.post').path, {
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

  return (
    <AuthLayout>
      <Head>
        <title>Login</title>
      </Head>
      <Box pos={'absolute'} top={10} left={10}>
        <Button
          disabled={mutation.isPending}
          onClick={() => {
            router.visit('/')
          }}
        >
          {mutation.isPending ? <Loader size={16} color="black" /> : <IconArrowLeft stroke={2} />}
          Home
        </Button>
      </Box>

      <div className={cn('flex flex-col gap-4 max-w-md mx-auto')}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Welcome</CardTitle>
            <CardDescription>Fill the form to login</CardDescription>
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
                onChange={(e) => form.setFieldValue('email', e.target.value)}
              />
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password*</Label>
                  {!props.hide_forgot_password && (
                    <Link
                      href={route('auth.resetPassword', { params: { token: '' } }).path}
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </Link>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="******"
                  required
                  value={form.values.password}
                  error={form.errors.password}
                  onChange={(e) => form.setFieldValue('password', e.target.value)}
                />
              </div>

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

              <Button className="w-full" disabled={mutation.isPending} onClick={() => doMutate()}>
                {mutation.isPending && <Loader size={16} color="black" />}
                Login
              </Button>

              {!props.hide_registration && (
                <div className="text-center text-sm">
                  Don&apos;t have an account?{' '}
                  <Link href={route('auth.register').path} className="underline underline-offset-4">
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  )
}
