import { getRequestFingerprint, mapRequestToQueryParams, returnError } from '#lib/utils'
import ActivityLogService from '#services/activity_log.service'
import { ActivityLogTransformer } from '#transformers/activity_log.transformer'
import { PaginationMeta } from '#types/app'
import { clearActivityLogRangeValidator } from '#validators/activity_log'

import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class ActivityLogController {
  constructor(protected activityLogSvc: ActivityLogService) {}

  async viewList({ request, bouncer, inertia }: HttpContext) {
    await bouncer.with('ActivityLogPolicy').authorize('view')

    const q = mapRequestToQueryParams(request)
    const dataQ = await this.activityLogSvc.index(q)
    const logDateBounds = await this.activityLogSvc.getCreatedAtBounds()

    return inertia.render('dashboard/activityLog/list', {
      data: ActivityLogTransformer.transform(dataQ.all()),
      meta: dataQ.getMeta() as PaginationMeta,
      log_date_bounds: logDateBounds,
    })
  }

  async clearRange({ request, response, bouncer, auth }: HttpContext) {
    try {
      await bouncer.with('ActivityLogPolicy').authorize('delete')

      const payload = await request.validateUsing(clearActivityLogRangeValidator)
      const { deletedCount } = await this.activityLogSvc.clearRange(
        payload.start_date,
        payload.end_date
      )

      await this.activityLogSvc.log(
        auth.user!.id,
        'clear_activity_log_range',
        `Cleared activity logs from:\n\`\`\`\n${payload.start_date} to ${payload.end_date}\n\`\`\`\nDeleted rows: ${deletedCount}`,
        {
          ...getRequestFingerprint(request),
          deleted_count: deletedCount,
          start_date: payload.start_date,
          end_date: payload.end_date,
        }
      )

      return response.status(200).json({
        status: 'success',
        message:
          deletedCount > 0
            ? `Successfully deleted ${deletedCount} activity log entries.`
            : 'No activity logs matched the selected date range.',
      })
    } catch (error) {
      return returnError(response, error, 'ACTIVITY_LOG_CLEAR_RANGE', { logErrors: true })
    }
  }
}
