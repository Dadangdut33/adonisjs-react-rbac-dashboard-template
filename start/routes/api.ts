import router from '@adonisjs/core/services/router'

import { middleware } from '../kernel.js'

const ProfileController = () => import('#controllers/profile.controller')

router
  .group(() => {
    router
      .group(() => {
        router
          .group(() => {
            router.get('/avatar', [ProfileController, 'getAvatar']).as('api.v1.me.avatar')
          })
          .prefix('/me')
      })
      .prefix('/v1')
  })
  .use([middleware.auth(), middleware.verify_email()])
  .prefix('/api')
