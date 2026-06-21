import { fetchMetadataThrottle, randomPasswordThrottle } from '#start/limiter'

import router from '@adonisjs/core/services/router'

import { middleware } from '../kernel.js'

const ProfileController = () => import('#controllers/profile.controller')
const MediaController = () => import('#controllers/media.controller')
const UtilsController = () => import('#controllers/utils.controller')
const BlogPublicController = () => import('#controllers/blog_public.controller')

router
  .group(() => {
    router
      .group(() => {
        // public API
        router
          .group(() => {
            router
              .group(() => {
                router
                  .get('/redirect/:id', [MediaController, 'redirectMediaAPI'])
                  .as('api.v1.media.redirect') // this route need signed URL for access. use router
              })
              .prefix('/media')

            router
              .group(() => {
                router
                  .get('/search', [BlogPublicController, 'searchAPI'])
                  .as('api.v1.public.blog.search')
              })
              .prefix('/blog')
          })
          .prefix('/public')

        // Authed User
        router
          .group(() => {
            router
              .group(() => {
                router.get('/avatar', [ProfileController, 'getAvatarAPI']).as('api.v1.me.avatar')
              })
              .prefix('/me')
          })
          .use([middleware.auth(), middleware.verify_email()])

        // Authed, Internal call only
        router
          .group(() => {
            router
              .group(() => {
                router.group(() => {
                  router.get('/', [MediaController, 'getMediaListAPI']).as('api.v1.media.list')
                  router.post('/', [MediaController, 'uploadMediaAPI']).as('api.v1.media.upload')
                  router.delete('/', [MediaController, 'deleteMediaAPI']).as('api.v1.media.destroy')
                })
              })
              .prefix('/media')

            router
              .group(() => {
                router
                  .get('/random-password', [UtilsController, 'generateRandomPassword'])
                  .as('api.v1.utils.random-password')
                  .use(randomPasswordThrottle)
                router
                  .get('/link-metadata', [UtilsController, 'getLinkMetadata'])
                  .as('api.v1.utils.link-metadata')
                  .use(fetchMetadataThrottle)
              })
              .prefix('/utils')
          })
          .use([middleware.auth(), middleware.verify_email(), middleware.internal_api_only()])
      })
      .prefix('/v1')
  })
  .prefix('/api')
