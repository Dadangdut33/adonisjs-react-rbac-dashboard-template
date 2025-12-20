import { SharedProps } from '@adonisjs/inertia/types'
import { Link, usePage } from '@inertiajs/react'
import { Image } from '@mantine/core'
import FlashAlert from '~/components/core/flash'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { props } = usePage<SharedProps>()

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 md:p-10">
      <div className="w-full max-w-2xl">
        <div className="flex w-full max-w-2xl flex-col gap-4">
          <Link href="/" className="flex items-center gap-2 self-center font-medium">
            <Image src={'/static/logo-transparent.png'} alt="Logo" w={150} h={120} />
          </Link>
        </div>
        <FlashAlert state={props.flashMessages ?? {}} />
        {children}
      </div>
    </div>
  )
}
