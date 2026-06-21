export const policies = {
  ActivityLogPolicy: () => import('#policies/activity_log_policy'),
  BlogPolicy: () => import('#policies/blog_policy'),
  CustomBasePolicy: () => import('#policies/custom_base_policy'),
  DashboardPolicy: () => import('#policies/dashboard_policy'),
  MainPolicy: () => import('#policies/main'),
  MediaPolicy: () => import('#policies/media_policy'),
  PermissionPolicy: () => import('#policies/permission_policy'),
  ProfilePolicy: () => import('#policies/profile_policy'),
  RolePolicy: () => import('#policies/role_policy'),
  UserPolicy: () => import('#policies/user_policy'),
}

