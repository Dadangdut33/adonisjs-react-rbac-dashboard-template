import { SharedProps } from '@adonisjs/inertia/types'
import { Box } from '@mantine/core'
import DashboardLayout from '~/layouts/dashboard'

export default function Home(props: SharedProps) {
  return (
    <DashboardLayout
      breadcrumbs={[
        {
          title: 'Dashboard',
          href: props.currentPath,
        },
      ]}
    >
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="aspect-video rounded-base bg-background/50 border-2 border-border" />
        <div className="aspect-video rounded-base bg-background/50 border-2 border-border" />
        <div className="aspect-video rounded-base bg-background/50 border-2 border-border" />
      </div>
      <div className="min-h-[100vh] flex-1 rounded-base bg-background/50 border-2 border-border md:min-h-min">
        <Box className="h-full w-full flex items-center justify-center">
          <div>
            <h1 className="text-4xl font-extrabold text-center">This is a dashboard!</h1>
            <br />
            <p>
              You can only access pages that you have permission to. (the sidebar is also designed
              to show by permission that you have)
            </p>
          </div>
        </Box>
      </div>
    </DashboardLayout>
  )
}
