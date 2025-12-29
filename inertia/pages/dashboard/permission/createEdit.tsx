import PermissionController from '#controllers/permission.controller'

import { InferPageProps, SharedProps } from '@adonisjs/inertia/types'
import DashboardLayout from '~/layouts/dashboard'

export default function Page(
  props:
    | (SharedProps & InferPageProps<PermissionController, 'viewEdit'>)
    | InferPageProps<PermissionController, 'viewCreate'>
) {
  return (
    <DashboardLayout breadcrumbs={[]}>
      <main className="inset-0 flex w-full flex-col items-center justify-center pt-[50px] px-4 m500:pt-[10px]">
        <div className="mx-auto w-container max-w-full px-5 text-center">
          <h1 className="text-2xl font-heading sm:text-4xl">Page Under Construction</h1>
        </div>
      </main>
    </DashboardLayout>
  )
}
