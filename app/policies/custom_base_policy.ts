import PermissionCheckService from '#services/permission_check.service'

import { BasePolicy } from '@adonisjs/bouncer'

export default class CustomBasePolicy extends BasePolicy {
  perm = new PermissionCheckService()
}
