import { SharedProps } from '@adonisjs/inertia/types'
import PublicLayout from '~/layouts/public'

export default function Home(props: SharedProps) {
  return (
    <PublicLayout>
      <main className="inset-0 flex w-full flex-col items-center justify-center pt-[50px] px-4 m500:pt-[10px]">
        <div className="mx-auto w-container max-w-full px-5 text-center">
          <h1 className="text-2xl font-heading sm:text-4xl">Page Under Construction</h1>
        </div>
      </main>
    </PublicLayout>
  )
}
