import router from '@adonisjs/core/services/router'

/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/
import './routes/api.js'
import './routes/auth.js'
import './routes/dashboard.js'

const HomeController = () => import('#controllers/home.controller')

router.group(() => {
  router.get('/', [HomeController, 'view']).as('home')
})
