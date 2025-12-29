import { SharedProps } from '@adonisjs/inertia/types'
import { Head } from '@inertiajs/react'
import { route } from '@izzyjs/route/client'
import DashboardLayout from '~/layouts/dashboard'

export default function Home(props: SharedProps) {
  return (
    <DashboardLayout
      breadcrumbs={[
        {
          title: 'Dashboard',
          href: route('dashboard.view').path,
        },
        {
          title: 'Permission',
          href: props.currentPath,
        },
      ]}
    >
      <Head title="Permission" />
      <div>test</div>
    </DashboardLayout>
  )
}
