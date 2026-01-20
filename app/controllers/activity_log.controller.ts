import { ActivityLogDto } from '#dto/activity_log.dto'
import { mapRequestToQueryParams } from '#lib/utils'
import ActivityLogService from '#services/activity_log.service'
import { PaginationMeta } from '#types/app'

import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class ActivityLogController {
  constructor(protected activityLogSvc: ActivityLogService) {}

  async viewList({ request, bouncer, inertia }: HttpContext) {
    await bouncer.with('ActivityLogPolicy').authorize('view')

    const q = mapRequestToQueryParams(request)
    const dataQ = await this.activityLogSvc.index(q)

    return inertia.render('dashboard/activityLog/list', {
      data: ActivityLogDto.collect(dataQ.all()),
      meta: dataQ.getMeta() as PaginationMeta,
    })
  }
}
