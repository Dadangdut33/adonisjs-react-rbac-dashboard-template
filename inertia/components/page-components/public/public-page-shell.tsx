import { Link } from '@adonisjs/inertia/react'
import { Fragment, type ReactNode } from 'react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '~/components/ui/breadcrumb'
import { cn } from '~/lib/utils'

type PublicBreadcrumbItem = {
  label: string
  href?: string
  current?: boolean
  className?: string
}

type PublicPageShellProps = {
  children: ReactNode
  breadcrumbs?: PublicBreadcrumbItem[]
  widthClassName?: string
  fontClassName?: string
  paddingClassName?: string
  breadCrumbsClassName?: string
  className?: string
}

export default function PublicPageShell({
  children,
  breadcrumbs = [],
  widthClassName = 'w-[1300px]',
  fontClassName = 'font-geist',
  paddingClassName = 'px-2 md:px-5 pt-5 pb-10',
  breadCrumbsClassName,
  className,
}: PublicPageShellProps) {
  return (
    <main
      className={cn(
        'mx-auto max-w-full',
        paddingClassName,
        fontClassName,
        widthClassName,
        className
      )}
    >
      {breadcrumbs.length > 0 ? (
        <Breadcrumb className={cn('mb-3 font-geistmono', breadCrumbsClassName)}>
          <BreadcrumbList className="w-full flex-nowrap overflow-x-auto overflow-y-hidden whitespace-nowrap pb-1 scrollbar-thin">
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1
              const shouldRenderAsCurrent = item.current || isLast || !item.href

              return (
                <Fragment key={`${item.label}-${index}`}>
                  <BreadcrumbItem className="min-w-0 shrink-0">
                    {shouldRenderAsCurrent ? (
                      <BreadcrumbPage
                        className={cn(
                          'block max-w-[min(70vw,32rem)] truncate sm:max-w-none',
                          item.className
                        )}
                        title={item.label}
                      >
                        {item.label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild className={cn('shrink-0', item.className)}>
                        <Link href={item.href!}>{item.label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast ? <BreadcrumbSeparator className="shrink-0" /> : null}
                </Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      ) : null}

      {children}
    </main>
  )
}
