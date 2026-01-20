'use client'

import { AuthUser } from '#types/models'

import { SharedProps } from '@adonisjs/inertia/types'
import { Link, usePage } from '@inertiajs/react'
import { route } from '@izzyjs/route/client'
import {
  Bot,
  Boxes,
  ChevronRight,
  ChevronsUpDown,
  GalleryVerticalEnd,
  History,
  Images,
  LayoutDashboard,
  LogOut,
  ShieldUser,
  SquareTerminal,
  User2,
  UserPen,
  UsersRound,
} from 'lucide-react'
import * as React from 'react'
import { useModals } from '~/components/core/modal/modal-hooks'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '~/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from '~/components/ui/sidebar'
import { useAvatar } from '~/hooks/use_avatar'
import { useLogout } from '~/hooks/use_logout'
import { getInitials } from '~/lib/utils'

type MenuItem = {
  title: string
  url: string
  icon?: React.ComponentType<{ className?: string }>
  flat?: boolean
  items?: {
    title: string
    url: string
    requiredPermission?: string
  }[]
  requiredPermission?: string
}

type SidebarMenuEntryProps = {
  item: MenuItem
  currentPath: string
  userPermissions: string[]
}

export function SidebarMenuEntry({ item, currentPath, userPermissions }: SidebarMenuEntryProps) {
  // ─────────────────────────────────────────────
  // Flat menu item
  // ─────────────────────────────────────────────
  if (item.flat) {
    if (item.requiredPermission && !userPermissions.includes(item.requiredPermission)) {
      return null
    }

    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          tooltip={item.title}
          isActive={currentPath === item.url}
          className="data-[state=open]:bg-main data-[state=open]:outline-border data-[state=open]:text-main-foreground"
        >
          <Link href={item.url}>
            {item.icon && <item.icon />}
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  // ─────────────────────────────────────────────
  // Collapsible menu item
  // ─────────────────────────────────────────────
  const isGroupActive = currentPath.startsWith(item.url)

  if (item.requiredPermission && !userPermissions.includes(item.requiredPermission)) {
    return null
  }

  return (
    <Collapsible asChild defaultOpen={isGroupActive} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip={item.title}
            isActive={isGroupActive}
            className="data-[state=open]:bg-main data-[state=open]:outline-border data-[state=open]:text-main-foreground"
          >
            {item.icon && <item.icon />}
            <span className="text-sm">{item.title}</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items?.map((subItem) => {
              if (
                subItem.requiredPermission &&
                !userPermissions.includes(subItem.requiredPermission)
              ) {
                return null
              }

              return (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton asChild isActive={currentPath === subItem.url}>
                    <Link href={subItem.url}>
                      <span>{subItem.title}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              )
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

// This is sample data.
const data = {
  flat: [
    {
      title: 'Dashboard',
      url: route('dashboard.view').path,
      icon: LayoutDashboard,
      flat: true,
      requiredPermission: 'dashboard.view',
    },
  ],
  menu: [
    {
      title: 'need dashboard.view',
      url: '#',
      icon: SquareTerminal,
      items: [
        {
          title: 'Submenu 1 (need profile.view)',
          url: '#',
          requiredPermission: 'profile.view',
        },
        {
          title: 'Submenu 2 (no perm needed)',
          url: '#',
        },
        {
          title: 'Submenu 3 (no perm needed)',
          url: '#',
        },
      ],
      requiredPermission: 'dashboard.view',
    },
    {
      title: 'no perm needed',
      url: '#',
      icon: Bot,
      items: [
        {
          title: 'Submenu 1',
          url: '#',
        },
        {
          title: 'Submenu 2',
          url: '#',
        },
      ],
    },
    {
      title: 'Profile',
      url: route('profile.view').path,
      icon: UserPen,
      flat: true,
      requiredPermission: 'profile.view',
    },
  ],
  management: [
    {
      title: 'Media',
      url: route('media.index').path,
      icon: Images,
      flat: true,
      requiredPermission: 'media.view',
    },
    {
      title: 'Users',
      url: route('user.index').path,
      icon: UsersRound,
      flat: true,
      requiredPermission: 'user.view',
    },
    {
      title: 'Roles',
      url: route('role.index').path,
      icon: Boxes,
      flat: true,
      requiredPermission: 'role.view',
    },
    {
      title: 'Permissions',
      url: route('permission.index').path,
      icon: ShieldUser,
      flat: true,
      requiredPermission: 'permission.view',
    },
    {
      title: 'Activity Log',
      url: route('activity_log.index').path,
      icon: History,
      flat: true,
      requiredPermission: 'activity_log.view',
    },
  ],
}

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar> & { user: AuthUser }) {
  const { isMobile, state } = useSidebar()
  const { props: sharedProps } = usePage<SharedProps>()
  const { ConfirmLogoutModal } = useModals()
  const { mutate: logout, isPending } = useLogout()
  const avatar = useAvatar()
  const initials = getInitials(sharedProps.user?.full_name || '')
  const avatarComp = (
    <Avatar className="h-8 w-8">
      <AvatarImage src={avatar} alt={initials} />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  )
  const userComp = (
    <div className="grid flex-1 text-left text-sm leading-tight">
      <span className="truncate font-heading">{sharedProps.user?.full_name}</span>
      <span className="truncate text-xs">{sharedProps.user?.email}</span>
    </div>
  )

  const confirm = ConfirmLogoutModal({
    onConfirm: () => {
      logout()
    },
  })

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href={'/'}>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-main data-[state=open]:text-main-foreground data-[state=open]:outline-border data-[state=open]:outline-2 cursor-pointer"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-base">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-heading">{'My Website'}</span>
                  <span className="truncate text-xs">{'a website for all'}</span>
                </div>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {data.flat.map((item) => (
              <SidebarMenuEntry
                key={item.title}
                item={item}
                currentPath={sharedProps.currentPath}
                userPermissions={sharedProps.user?.permissions || []}
              />
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarMenu>
            {data.menu.map((item) => (
              <SidebarMenuEntry
                key={item.title}
                item={item}
                currentPath={sharedProps.currentPath}
                userPermissions={sharedProps.user?.permissions || []}
              />
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarMenu>
            {data.management.map((item) => (
              <SidebarMenuEntry
                key={item.title}
                item={item}
                currentPath={sharedProps.currentPath}
                userPermissions={sharedProps.user?.permissions || []}
              />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  className="group-data-[state=collapsed]:hover:outline-0 group-data-[state=collapsed]:hover:bg-transparent overflow-visible"
                  size="lg"
                >
                  {avatarComp}
                  {userComp}
                  {state === 'expanded' && <ChevronsUpDown className="ml-auto size-4" />}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
                side={isMobile ? 'bottom' : 'right'}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-base">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    {avatarComp}
                    {userComp}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <User2 />
                    Profile
                  </DropdownMenuItem>
                  {/* <DropdownMenuItem>
                    <Bell />
                    Notifications
                  </DropdownMenuItem> */}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => confirm()}
                  disabled={isPending}
                >
                  <LogOut />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
