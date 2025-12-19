import { SharedProps } from '@adonisjs/inertia/types'
import { usePage } from '@inertiajs/react'
import Analytics from '~/components/core/analytics'
import FlashAlert from '~/components/core/flash'

import Footer from './footer'
import Navbar from './navbar'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const { props } = usePage<SharedProps>()

  return (
    <>
      <Analytics id={props.umami_id} url={props.umami_public_url} />
      <div className="flex flex-col min-h-screen w-full" id="main">
        <Navbar />
        <FlashAlert state={props.flashMessages ?? {}} mt={'md'} />
        <div className="pt-[85px] mb-8" id="content">
          {children}
        </div>
        <Footer />
      </div>
    </>
  )
}
