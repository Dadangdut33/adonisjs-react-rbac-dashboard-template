import { SharedProps } from '@adonisjs/inertia/types'
import { Stack } from '@mantine/core'
import PublicLayout from '~/layouts/public'

export default function Home(props: SharedProps) {
  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto pt-5">
        <Stack>
          <h1 className="text-4xl font-extrabold text-center">Hello World!</h1>
          <p className="text-xl text-neutral-500 dark:text-white/80 text-center">
            Visit the official{' '}
            <a className="text-link" href="https://adonisjs.com">
              AdonisJS website
            </a>{' '}
            for more information.
          </p>

          <p className="text-center">
            Make sure you run the seeder to create the initial data and the superadmin role for the
            dashboard
            <br />
            *User role can only see the dashboard page. You can change this permission in the
            dashboard when you logged in as superadmin.
          </p>
        </Stack>
      </div>
    </PublicLayout>
  )
}
