import { SharedProps } from '@adonisjs/inertia/types'
import { Link, usePage } from '@inertiajs/react'
import React from 'react'
import { ThemeSwitcher } from '~/components/core/theme-switcher'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '~/components/ui/breadcrumb'
import { Separator } from '~/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTriggerOrResetWidth } from '~/components/ui/sidebar'
import { cn } from '~/lib/utils'

import { AppSidebar } from './sidebar'

export type breadcrumbItem = {
  title: string
  href?: string
}

export default function DashboardLayout({
  children,
  breadcrumbs,
  className,
  withSeparator = true,
}: {
  children: React.ReactNode
  breadcrumbs: breadcrumbItem[]
  className?: string | undefined
  withSeparator?: boolean
}) {
  const { props } = usePage<SharedProps>()

  return (
    <SidebarProvider>
      <AppSidebar user={props.user!} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="w-full">
            <div className="flex items-center gap-2 px-4 ">
              {/* left side */}
              <SidebarTriggerOrResetWidth className="-ml-1" />
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((item, index) => (
                    <React.Fragment key={index}>
                      <BreadcrumbItem>
                        {item.href ? (
                          <BreadcrumbLink asChild>
                            <Link href={item.href}>{item.title}</Link>
                          </BreadcrumbLink>
                        ) : (
                          <BreadcrumbPage>{item.title}</BreadcrumbPage>
                        )}
                      </BreadcrumbItem>
                      {index < breadcrumbs.length - 1 && (
                        <BreadcrumbSeparator className="block" key={`sep-${index}`} />
                      )}
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>

              {/* right side */}
              <div className="ms-auto">
                <ThemeSwitcher />
              </div>
            </div>
            {withSeparator && <Separator className="mt-1 mb-2" />}
          </div>
        </header>
        <div className={cn('flex flex-1 flex-col px-4 pt-0 pb-4', className)}>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
