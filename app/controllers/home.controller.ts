import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'

@inject()
export default class HomeController {
  constructor() {}

  async view({ inertia }: HttpContext) {
    return inertia.render('home')
  }
}
