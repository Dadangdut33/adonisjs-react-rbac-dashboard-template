import router from '@adonisjs/core/services/router'

import { middleware } from '../kernel.js'

const DashboardController = () => import('#controllers/dashboard.controller')
const UsersController = () => import('#controllers/users.controller')

router
  .group(() => {
    router.get('/', [DashboardController, 'view']).as('dashboard')

    router
      .group(() => {
        router.get('/', [UsersController, 'viewList']).as('users.index')
        router.post('/', [UsersController, 'storeOrUpdate']).as('users.store')
        router.patch('/', [UsersController, 'storeOrUpdate']).as('users.update')
        router.delete('/:id', [UsersController, 'destroy']).as('users.destroy')
      })
      .prefix('/users')
  })
  .use([middleware.auth(), middleware.verify_email()])
  .prefix('/dashboard')
