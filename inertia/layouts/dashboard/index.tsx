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
import { SidebarInset, SidebarProvider, SidebarTrigger } from '~/components/ui/sidebar'

import { AppSidebar } from './sidebar'

export type breadcrumbItem = {
  title: string
  href?: string
}

export default function DashboardLayout({
  children,
  breadcrumbs,
}: { children: React.ReactNode } & { breadcrumbs: breadcrumbItem[] }) {
  const { props } = usePage<SharedProps>()

  return (
    <SidebarProvider>
      <AppSidebar user={props.user!} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4 w-full">
            <SidebarTrigger className="-ml-1" />
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
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
