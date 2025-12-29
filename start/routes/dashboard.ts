import router from '@adonisjs/core/services/router'

import { middleware } from '../kernel.js'

const DashboardController = () => import('#controllers/dashboard.controller')
const UserController = () => import('#controllers/user.controller')
const PermissionController = () => import('#controllers/permission.controller')
const ProfileController = () => import('#controllers/profile.controller')

router
  .group(() => {
    router.get('/', [DashboardController, 'view']).as('dashboard.view')

    router
      .group(() => {
        router.get('/', [ProfileController, 'view']).as('profile.view')
        router.patch('/', [ProfileController, 'update']).as('profile.update')
      })
      .prefix('/profile')

    router
      .group(() => {
        router.get('/', [UserController, 'viewList']).as('user.view')
        router.post('/', [UserController, 'storeOrUpdate']).as('user.store')
        router.patch('/', [UserController, 'storeOrUpdate']).as('user.update')
        router.delete('/:id', [UserController, 'destroy']).as('user.destroy')
      })
      .prefix('/users')

    router
      .group(() => {
        router.get('/', [PermissionController, 'viewList']).as('permissions.view')
        router.post('/', [PermissionController, 'storeOrUpdate']).as('permissions.store')
        router.patch('/', [PermissionController, 'storeOrUpdate']).as('permissions.update')
        router.delete('/:id', [PermissionController, 'destroy']).as('permissions.destroy')
      })
      .prefix('/permissions')
  })
  .use([middleware.auth(), middleware.verify_email()])
  .prefix('/dashboard')
