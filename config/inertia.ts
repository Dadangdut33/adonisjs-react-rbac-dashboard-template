import env from '#start/env'
import { FlashAlertType } from '#types/app'
import { AuthUser } from '#types/models'

import cache from '@adonisjs/cache/services/main'
import { defineConfig } from '@adonisjs/inertia'
import type { InferSharedProps } from '@adonisjs/inertia/types'

const inertiaConfig = defineConfig({
  /**
   * Path to the Edge view that will be used as the root view for Inertia responses
   */
  rootView: 'inertia_layout',

  /**
   * Data that should be shared with all rendered pages
   */
  sharedData: {
    user: (ctx) =>
      ctx.inertia.always(async () => {
        const u = ctx.auth ? ctx.auth.user : null
        if (!u) return null

        // get the user permissions in cache that is valid for 1 hour
        const rolePerm = await cache.getOrSet({
          key: `user_roles_permissions_${u.id}`,
          ttl: '1h', // 1 hour
          factory: async () => {
            const roles = await u.related('roles').query().preload('permissions')
            const flatPermissions = roles.flatMap((r) => r.permissions.map((p) => p.name))
            return {
              permissions: Array.from(new Set(flatPermissions)),
              roles: roles.map((r) => r.name),
            }
          },
        })

        return {
          id: u.id,
          username: u.username,
          full_name: u.full_name,
          email: u.email,
          is_email_verified: u.is_email_verified,
          roles: rolePerm.roles,
          permissions: rolePerm.permissions,
        }
      }) as unknown as null | AuthUser,
    flashMessages: (ctx) => (ctx.session ? (ctx.session.flashMessages as FlashAlertType) : null),
    currentPath: (ctx) => ctx.request.url(false),
    previousPath: (ctx) => {
      const referer = ctx.request.header('referer')
      if (!referer) return undefined
      try {
        const url = new URL(referer, ctx.request.completeUrl())
        return url.pathname
      } catch {
        return undefined
      }
    },
    currentURL: (ctx) => ctx.request.completeUrl(),
    previousURL: (ctx) => ctx.request.header('referer'),
    umami_id: () => env.get('UMAMI_ID'),
    umami_public_url: () => env.get('UMAMI_PUBLIC_URL'),
    umami_share_url: () => env.get('UMAMI_SHARE_URL'),
  },

  /**
   * Options for the server-side rendering
   */
  ssr: {
    enabled: true,
    entrypoint: 'inertia/app/ssr.tsx',
  },
})

export default inertiaConfig

declare module '@adonisjs/inertia/types' {
  export interface SharedProps extends InferSharedProps<typeof inertiaConfig> {}
}
