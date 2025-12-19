import { throwForbidden } from '#lib/utils'

import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'

@inject()
export default class HomeController {
  constructor() {}

  async view({ inertia, bouncer }: HttpContext) {
    if (await bouncer.with('DashboardPolicy').denies('view')) return throwForbidden()

    return inertia.render('dashboard/index')
  }
}
