import { SharedProps } from '@adonisjs/inertia/types'
import DashboardLayout from '~/layouts/dashboard'

export default function Home(props: SharedProps) {
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-heading sm:text-4xl">Page Under Construction</h1>
    </DashboardLayout>
  )
}
