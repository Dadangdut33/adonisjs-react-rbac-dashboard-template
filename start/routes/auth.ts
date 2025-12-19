import { middleware } from '#start/kernel'
import {
  loginThrottle,
  reAskEmailVerifThrottle,
  registerThrottle,
  resetPasswordThrottle as resetPasswordRequestThrottle,
  verifEmailThrottle,
} from '#start/limiter'

import router from '@adonisjs/core/services/router'

const AuthController = () => import('#controllers/auth.controller')

router
  .group(() => {
    router.post('/logout', [AuthController, 'logout']).as('auth.logout').use([middleware.auth()])

    router
      .get('/login', [AuthController, 'viewLogin'])
      .as('auth.login')
      .use([middleware.is_logged_in()])
    router
      .post('/login', [AuthController, 'login'])
      .as('auth.login.post')
      .use([middleware.is_logged_in(), loginThrottle])

    router
      .get('/register', [AuthController, 'viewRegister'])
      .as('auth.register')
      .use([middleware.is_logged_in()])
    router
      .post('/register', [AuthController, 'register'])
      .as('auth.register.post')
      .use([middleware.is_logged_in(), registerThrottle])

    router
      .get('/reset-password', [AuthController, 'viewRequestResetPassword'])
      .as('auth.requestResetPassword')
    router
      .post('/reset-password/request', [AuthController, 'requestResetPassword'])
      .as('auth.requestResetPassword.post')
      .use(resetPasswordRequestThrottle)
    router
      .get('/reset-password/:token', [AuthController, 'viewResetPassword'])
      .as('auth.resetPassword')
    router.post('/reset-password', [AuthController, 'resetPassword']).as('auth.resetPassword.post')

    router
      .get('/verify-email', [AuthController, 'viewVerifyEmail'])
      .as('auth.verifyEmail')
      .use(middleware.auth())
    router
      .get('/verify-email/verify/:token', [AuthController, 'verifyEmail'])
      .as('auth.verifyEmail.verify')
      .use([verifEmailThrottle, middleware.auth()])
    router
      .post('/verify-email/request', [AuthController, 'requestVerifyEmail'])
      .as('auth.verifyEmail.request')
      .use([reAskEmailVerifThrottle, middleware.auth()])
  })
  .prefix('/auth')
