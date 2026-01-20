import { LazyImport } from '@adonisjs/bouncer/types'
import router from '@adonisjs/core/services/router'

import { middleware } from '../kernel.js'

const DashboardController = () => import('#controllers/dashboard.controller')
const UserController = () => import('#controllers/user.controller')
const PermissionController = () => import('#controllers/permission.controller')
const ProfileController = () => import('#controllers/profile.controller')
const RoleController = () => import('#controllers/role.controller')
const MediaController = () => import('#controllers/media.controller')

type ControllerImport<T> = T | LazyImport<T>

function mapGenericRoutes<TController>(
  prefix: string,
  controller: ControllerImport<TController>,
  name: string,
  withBulkDelete: boolean = false
) {
  router
    .group(() => {
      router.get('/', [controller as any, 'viewList']).as(`${name}.index`)
      router.get('/create', [controller as any, 'viewCreate']).as(`${name}.create`)
      router.get('/edit/:id', [controller as any, 'viewEdit']).as(`${name}.edit`)
      router.post('/store', [controller as any, 'storeOrUpdate']).as(`${name}.store`)
      router.patch('/update', [controller as any, 'storeOrUpdate']).as(`${name}.update`)
      router.delete('/delete/:id', [controller as any, 'destroy']).as(`${name}.destroy`)
      if (withBulkDelete) {
        router.delete('/bulk-delete', [controller as any, 'bulkDestroy']).as(`${name}.bulkDestroy`)
      }
    })
    .prefix(prefix)
}

router
  .group(() => {
    router.get('/', [DashboardController, 'view']).as('dashboard.view')

    router
      .group(() => {
        router.get('/', [ProfileController, 'view']).as('profile.view')
        router.patch('/', [ProfileController, 'update']).as('profile.update')
      })
      .prefix('/profile')

    mapGenericRoutes('/users', UserController, 'user', true)
    mapGenericRoutes('/permissions', PermissionController, 'permission', true)
    mapGenericRoutes('/roles', RoleController, 'role', true)
    mapGenericRoutes('/media', MediaController, 'media', true)
  })
  .use([middleware.auth(), middleware.verify_email()])
  .prefix('/dashboard')
