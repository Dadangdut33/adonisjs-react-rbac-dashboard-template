import env from '#start/env'
import type { FlashAlertType } from '#types/app'
import type { AuthUser } from '#types/models'

import cache from '@adonisjs/cache/services/main'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import BaseInertiaMiddleware from '@adonisjs/inertia/inertia_middleware'

export default class InertiaMiddleware extends BaseInertiaMiddleware {
  share(ctx: HttpContext) {
    const { session } = ctx as Partial<HttpContext>

    return {
      errors: ctx.inertia.always(this.getValidationErrors(ctx)),
      flash: ctx.inertia.always({
        error: session?.flashMessages.get('error'),
        success: session?.flashMessages.get('success'),
      }),
      user: async () => {
        const u = ctx.auth ? ctx.auth.user : null
        if (!u) return undefined

        const rolePerm = await cache.getOrSet({
          key: `user_roles_permissions_${u.id}`,
          ttl: '1h',
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
        } as AuthUser
      },
      flashMessages: ctx.inertia.always(
        session ? (session.flashMessages as FlashAlertType) : undefined
      ),
      currentPath: ctx.inertia.always(ctx.request.url(false)),
      previousPath: () => {
        const referer = ctx.request.header('referer')
        if (!referer) return undefined

        try {
          const url = new URL(referer, ctx.request.completeUrl())
          return url.pathname
        } catch {
          return undefined
        }
      },
      currentURL: ctx.inertia.always(ctx.request.completeUrl()),
      previousURL: ctx.inertia.always(ctx.request.header('referer')),
      isProduction: ctx.inertia.always(env.get('NODE_ENV') === 'production'),
      umami_id: ctx.inertia.always(env.get('UMAMI_ID')),
      umami_public_url: ctx.inertia.always(env.get('UMAMI_PUBLIC_URL')),
      umami_share_url: ctx.inertia.always(env.get('UMAMI_SHARE_URL')),
    }
  }

  async handle(ctx: HttpContext, next: NextFn) {
    await this.init(ctx)
    const output = await next()
    this.dispose(ctx)
    return output
  }
}

declare module '@adonisjs/inertia/types' {
  type MiddlewareSharedProps = InferSharedProps<InertiaMiddleware>

  export interface SharedProps extends MiddlewareSharedProps {}
}
