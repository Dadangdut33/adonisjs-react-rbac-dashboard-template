enum Tables {
  // user & auth
  USERS = 'users',
  USER_ROLES = 'user_roles',
  USER_PROFILES = 'user_profiles',
  ROLES = 'roles',
  PERMISSIONS = 'permissions',
  ROLE_PERMISSIONS = 'role_permissions',
  ROLE_MEDIA_TAGS = 'role_media_tags',

  // system
  TOKENS = 'tokens',
  ACCESS_TOKEN = 'auth_access_tokens',
  REMEMBER_ME_TOKEN = 'remember_me_tokens',
  RATE_LIMITS = 'rate_limits',
  ACTIVITY_LOGS = 'activity_logs',

  // content
  MEDIAS = 'medias',
  BLOGS = 'blogs',
  TAGS = 'tags',
  BLOG_VERSIONS = 'blog_versions',
  BLOG_TAGS = 'blog_tags',
  BLOG_VERSION_TAGS = 'blog_version_tags',
  MEDIA_TAGS = 'media_tags',
}

export default Tables
