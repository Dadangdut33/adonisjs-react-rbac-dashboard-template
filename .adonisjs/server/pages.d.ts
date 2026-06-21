import '@adonisjs/inertia/types'

import type React from 'react'
import type { Prettify } from '@adonisjs/core/types/common'

type ExtractProps<T> =
  T extends React.FC<infer Props>
    ? Prettify<Omit<Props, 'children'>>
    : T extends React.Component<infer Props>
      ? Prettify<Omit<Props, 'children'>>
      : never

declare module '@adonisjs/inertia/types' {
  export interface InertiaPages {
    'auth/login': ExtractProps<(typeof import('../../inertia/pages/auth/login.tsx'))['default']>
    'auth/register': ExtractProps<(typeof import('../../inertia/pages/auth/register.tsx'))['default']>
    'auth/requestResetPassword': ExtractProps<(typeof import('../../inertia/pages/auth/requestResetPassword.tsx'))['default']>
    'auth/resetPassword': ExtractProps<(typeof import('../../inertia/pages/auth/resetPassword.tsx'))['default']>
    'auth/types': ExtractProps<(typeof import('../../inertia/pages/auth/types.ts'))['default']>
    'auth/verifyEmail': ExtractProps<(typeof import('../../inertia/pages/auth/verifyEmail.tsx'))['default']>
    'blog/index': ExtractProps<(typeof import('../../inertia/pages/blog/index.tsx'))['default']>
    'blog/post': ExtractProps<(typeof import('../../inertia/pages/blog/post.tsx'))['default']>
    'dashboard/activityLog/list': ExtractProps<(typeof import('../../inertia/pages/dashboard/activityLog/list.tsx'))['default']>
    'dashboard/blog/createEdit': ExtractProps<(typeof import('../../inertia/pages/dashboard/blog/createEdit.tsx'))['default']>
    'dashboard/blog/list': ExtractProps<(typeof import('../../inertia/pages/dashboard/blog/list.tsx'))['default']>
    'dashboard/index': ExtractProps<(typeof import('../../inertia/pages/dashboard/index.tsx'))['default']>
    'dashboard/media/list': ExtractProps<(typeof import('../../inertia/pages/dashboard/media/list.tsx'))['default']>
    'dashboard/permission/createEdit': ExtractProps<(typeof import('../../inertia/pages/dashboard/permission/createEdit.tsx'))['default']>
    'dashboard/permission/list': ExtractProps<(typeof import('../../inertia/pages/dashboard/permission/list.tsx'))['default']>
    'dashboard/profile': ExtractProps<(typeof import('../../inertia/pages/dashboard/profile.tsx'))['default']>
    'dashboard/role/createEdit': ExtractProps<(typeof import('../../inertia/pages/dashboard/role/createEdit.tsx'))['default']>
    'dashboard/role/list': ExtractProps<(typeof import('../../inertia/pages/dashboard/role/list.tsx'))['default']>
    'dashboard/user/createEdit': ExtractProps<(typeof import('../../inertia/pages/dashboard/user/createEdit.tsx'))['default']>
    'dashboard/user/list': ExtractProps<(typeof import('../../inertia/pages/dashboard/user/list.tsx'))['default']>
    'errors/button_group': ExtractProps<(typeof import('../../inertia/pages/errors/button_group.tsx'))['default']>
    'errors/not_allowed': ExtractProps<(typeof import('../../inertia/pages/errors/not_allowed.tsx'))['default']>
    'errors/not_authorized': ExtractProps<(typeof import('../../inertia/pages/errors/not_authorized.tsx'))['default']>
    'errors/not_found': ExtractProps<(typeof import('../../inertia/pages/errors/not_found.tsx'))['default']>
    'errors/server_error': ExtractProps<(typeof import('../../inertia/pages/errors/server_error.tsx'))['default']>
    'home': ExtractProps<(typeof import('../../inertia/pages/home.tsx'))['default']>
  }
}
