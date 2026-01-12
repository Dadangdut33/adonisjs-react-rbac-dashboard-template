import router from '@adonisjs/core/services/router'

import { middleware } from '../kernel.js'

const ProfileController = () => import('#controllers/profile.controller')
const MediaController = () => import('#controllers/media.controller')

router
  .group(() => {
    router
      .group(() => {
        router
          .group(() => {
            router.get('/avatar', [ProfileController, 'getAvatarAPI']).as('api.v1.me.avatar')
          })
          .prefix('/me')

        router
          .group(() => {
            router
              .get('/redirect/:id', [MediaController, 'redirectMediaAPI'])
              .as('api.v1.media.redirect')
          })
          .prefix('/media')
      })
      .prefix('/v1')
  })
  .use([middleware.auth(), middleware.verify_email()])
  .prefix('/api')
