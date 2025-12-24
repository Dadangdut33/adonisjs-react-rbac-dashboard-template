import router from '@adonisjs/core/services/router'

import { middleware } from '../kernel.js'

const DashboardController = () => import('#controllers/dashboard.controller')
const UsersController = () => import('#controllers/users.controller')
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
        router.get('/', [UsersController, 'viewList']).as('users.view')
        router.post('/', [UsersController, 'storeOrUpdate']).as('users.store')
        router.patch('/', [UsersController, 'storeOrUpdate']).as('users.update')
        router.delete('/:id', [UsersController, 'destroy']).as('users.destroy')
      })
      .prefix('/users')
  })
  .use([middleware.auth(), middleware.verify_email()])
  .prefix('/dashboard')
