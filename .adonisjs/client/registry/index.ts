/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'drive.fs.serve': {
    methods: ["GET","HEAD"],
    pattern: '/uploads/*',
    tokens: [{"old":"/uploads/*","type":0,"val":"uploads","end":""},{"old":"/uploads/*","type":2,"val":"*","end":""}],
    types: placeholder as Registry['drive.fs.serve']['types'],
  },
  'dashboard.view': {
    methods: ["GET","HEAD"],
    pattern: '/dashboard',
    tokens: [{"old":"/dashboard","type":0,"val":"dashboard","end":""}],
    types: placeholder as Registry['dashboard.view']['types'],
  },
  'profile.view': {
    methods: ["GET","HEAD"],
    pattern: '/dashboard/profile',
    tokens: [{"old":"/dashboard/profile","type":0,"val":"dashboard","end":""},{"old":"/dashboard/profile","type":0,"val":"profile","end":""}],
    types: placeholder as Registry['profile.view']['types'],
  },
  'profile.update': {
    methods: ["PATCH"],
    pattern: '/dashboard/profile',
    tokens: [{"old":"/dashboard/profile","type":0,"val":"dashboard","end":""},{"old":"/dashboard/profile","type":0,"val":"profile","end":""}],
    types: placeholder as Registry['profile.update']['types'],
  },
  'user.index': {
    methods: ["GET","HEAD"],
    pattern: '/dashboard/users',
    tokens: [{"old":"/dashboard/users","type":0,"val":"dashboard","end":""},{"old":"/dashboard/users","type":0,"val":"users","end":""}],
    types: placeholder as Registry['user.index']['types'],
  },
  'user.create': {
    methods: ["GET","HEAD"],
    pattern: '/dashboard/users/create',
    tokens: [{"old":"/dashboard/users/create","type":0,"val":"dashboard","end":""},{"old":"/dashboard/users/create","type":0,"val":"users","end":""},{"old":"/dashboard/users/create","type":0,"val":"create","end":""}],
    types: placeholder as Registry['user.create']['types'],
  },
  'user.edit': {
    methods: ["GET","HEAD"],
    pattern: '/dashboard/users/edit/:id',
    tokens: [{"old":"/dashboard/users/edit/:id","type":0,"val":"dashboard","end":""},{"old":"/dashboard/users/edit/:id","type":0,"val":"users","end":""},{"old":"/dashboard/users/edit/:id","type":0,"val":"edit","end":""},{"old":"/dashboard/users/edit/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['user.edit']['types'],
  },
  'user.store': {
    methods: ["POST"],
    pattern: '/dashboard/users/store',
    tokens: [{"old":"/dashboard/users/store","type":0,"val":"dashboard","end":""},{"old":"/dashboard/users/store","type":0,"val":"users","end":""},{"old":"/dashboard/users/store","type":0,"val":"store","end":""}],
    types: placeholder as Registry['user.store']['types'],
  },
  'user.update': {
    methods: ["PATCH"],
    pattern: '/dashboard/users/update',
    tokens: [{"old":"/dashboard/users/update","type":0,"val":"dashboard","end":""},{"old":"/dashboard/users/update","type":0,"val":"users","end":""},{"old":"/dashboard/users/update","type":0,"val":"update","end":""}],
    types: placeholder as Registry['user.update']['types'],
  },
  'user.destroy': {
    methods: ["DELETE"],
    pattern: '/dashboard/users/delete/:id',
    tokens: [{"old":"/dashboard/users/delete/:id","type":0,"val":"dashboard","end":""},{"old":"/dashboard/users/delete/:id","type":0,"val":"users","end":""},{"old":"/dashboard/users/delete/:id","type":0,"val":"delete","end":""},{"old":"/dashboard/users/delete/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['user.destroy']['types'],
  },
  'user.bulkDestroy': {
    methods: ["DELETE"],
    pattern: '/dashboard/users/bulk-delete',
    tokens: [{"old":"/dashboard/users/bulk-delete","type":0,"val":"dashboard","end":""},{"old":"/dashboard/users/bulk-delete","type":0,"val":"users","end":""},{"old":"/dashboard/users/bulk-delete","type":0,"val":"bulk-delete","end":""}],
    types: placeholder as Registry['user.bulkDestroy']['types'],
  },
  'permission.index': {
    methods: ["GET","HEAD"],
    pattern: '/dashboard/permissions',
    tokens: [{"old":"/dashboard/permissions","type":0,"val":"dashboard","end":""},{"old":"/dashboard/permissions","type":0,"val":"permissions","end":""}],
    types: placeholder as Registry['permission.index']['types'],
  },
  'permission.create': {
    methods: ["GET","HEAD"],
    pattern: '/dashboard/permissions/create',
    tokens: [{"old":"/dashboard/permissions/create","type":0,"val":"dashboard","end":""},{"old":"/dashboard/permissions/create","type":0,"val":"permissions","end":""},{"old":"/dashboard/permissions/create","type":0,"val":"create","end":""}],
    types: placeholder as Registry['permission.create']['types'],
  },
  'permission.edit': {
    methods: ["GET","HEAD"],
    pattern: '/dashboard/permissions/edit/:id',
    tokens: [{"old":"/dashboard/permissions/edit/:id","type":0,"val":"dashboard","end":""},{"old":"/dashboard/permissions/edit/:id","type":0,"val":"permissions","end":""},{"old":"/dashboard/permissions/edit/:id","type":0,"val":"edit","end":""},{"old":"/dashboard/permissions/edit/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['permission.edit']['types'],
  },
  'permission.store': {
    methods: ["POST"],
    pattern: '/dashboard/permissions/store',
    tokens: [{"old":"/dashboard/permissions/store","type":0,"val":"dashboard","end":""},{"old":"/dashboard/permissions/store","type":0,"val":"permissions","end":""},{"old":"/dashboard/permissions/store","type":0,"val":"store","end":""}],
    types: placeholder as Registry['permission.store']['types'],
  },
  'permission.update': {
    methods: ["PATCH"],
    pattern: '/dashboard/permissions/update',
    tokens: [{"old":"/dashboard/permissions/update","type":0,"val":"dashboard","end":""},{"old":"/dashboard/permissions/update","type":0,"val":"permissions","end":""},{"old":"/dashboard/permissions/update","type":0,"val":"update","end":""}],
    types: placeholder as Registry['permission.update']['types'],
  },
  'permission.destroy': {
    methods: ["DELETE"],
    pattern: '/dashboard/permissions/delete/:id',
    tokens: [{"old":"/dashboard/permissions/delete/:id","type":0,"val":"dashboard","end":""},{"old":"/dashboard/permissions/delete/:id","type":0,"val":"permissions","end":""},{"old":"/dashboard/permissions/delete/:id","type":0,"val":"delete","end":""},{"old":"/dashboard/permissions/delete/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['permission.destroy']['types'],
  },
  'permission.bulkDestroy': {
    methods: ["DELETE"],
    pattern: '/dashboard/permissions/bulk-delete',
    tokens: [{"old":"/dashboard/permissions/bulk-delete","type":0,"val":"dashboard","end":""},{"old":"/dashboard/permissions/bulk-delete","type":0,"val":"permissions","end":""},{"old":"/dashboard/permissions/bulk-delete","type":0,"val":"bulk-delete","end":""}],
    types: placeholder as Registry['permission.bulkDestroy']['types'],
  },
  'role.index': {
    methods: ["GET","HEAD"],
    pattern: '/dashboard/roles',
    tokens: [{"old":"/dashboard/roles","type":0,"val":"dashboard","end":""},{"old":"/dashboard/roles","type":0,"val":"roles","end":""}],
    types: placeholder as Registry['role.index']['types'],
  },
  'role.create': {
    methods: ["GET","HEAD"],
    pattern: '/dashboard/roles/create',
    tokens: [{"old":"/dashboard/roles/create","type":0,"val":"dashboard","end":""},{"old":"/dashboard/roles/create","type":0,"val":"roles","end":""},{"old":"/dashboard/roles/create","type":0,"val":"create","end":""}],
    types: placeholder as Registry['role.create']['types'],
  },
  'role.edit': {
    methods: ["GET","HEAD"],
    pattern: '/dashboard/roles/edit/:id',
    tokens: [{"old":"/dashboard/roles/edit/:id","type":0,"val":"dashboard","end":""},{"old":"/dashboard/roles/edit/:id","type":0,"val":"roles","end":""},{"old":"/dashboard/roles/edit/:id","type":0,"val":"edit","end":""},{"old":"/dashboard/roles/edit/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['role.edit']['types'],
  },
  'role.store': {
    methods: ["POST"],
    pattern: '/dashboard/roles/store',
    tokens: [{"old":"/dashboard/roles/store","type":0,"val":"dashboard","end":""},{"old":"/dashboard/roles/store","type":0,"val":"roles","end":""},{"old":"/dashboard/roles/store","type":0,"val":"store","end":""}],
    types: placeholder as Registry['role.store']['types'],
  },
  'role.update': {
    methods: ["PATCH"],
    pattern: '/dashboard/roles/update',
    tokens: [{"old":"/dashboard/roles/update","type":0,"val":"dashboard","end":""},{"old":"/dashboard/roles/update","type":0,"val":"roles","end":""},{"old":"/dashboard/roles/update","type":0,"val":"update","end":""}],
    types: placeholder as Registry['role.update']['types'],
  },
  'role.destroy': {
    methods: ["DELETE"],
    pattern: '/dashboard/roles/delete/:id',
    tokens: [{"old":"/dashboard/roles/delete/:id","type":0,"val":"dashboard","end":""},{"old":"/dashboard/roles/delete/:id","type":0,"val":"roles","end":""},{"old":"/dashboard/roles/delete/:id","type":0,"val":"delete","end":""},{"old":"/dashboard/roles/delete/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['role.destroy']['types'],
  },
  'role.bulkDestroy': {
    methods: ["DELETE"],
    pattern: '/dashboard/roles/bulk-delete',
    tokens: [{"old":"/dashboard/roles/bulk-delete","type":0,"val":"dashboard","end":""},{"old":"/dashboard/roles/bulk-delete","type":0,"val":"roles","end":""},{"old":"/dashboard/roles/bulk-delete","type":0,"val":"bulk-delete","end":""}],
    types: placeholder as Registry['role.bulkDestroy']['types'],
  },
  'media.index': {
    methods: ["GET","HEAD"],
    pattern: '/dashboard/media',
    tokens: [{"old":"/dashboard/media","type":0,"val":"dashboard","end":""},{"old":"/dashboard/media","type":0,"val":"media","end":""}],
    types: placeholder as Registry['media.index']['types'],
  },
  'media.create': {
    methods: ["GET","HEAD"],
    pattern: '/dashboard/media/create',
    tokens: [{"old":"/dashboard/media/create","type":0,"val":"dashboard","end":""},{"old":"/dashboard/media/create","type":0,"val":"media","end":""},{"old":"/dashboard/media/create","type":0,"val":"create","end":""}],
    types: placeholder as Registry['media.create']['types'],
  },
  'media.edit': {
    methods: ["GET","HEAD"],
    pattern: '/dashboard/media/edit/:id',
    tokens: [{"old":"/dashboard/media/edit/:id","type":0,"val":"dashboard","end":""},{"old":"/dashboard/media/edit/:id","type":0,"val":"media","end":""},{"old":"/dashboard/media/edit/:id","type":0,"val":"edit","end":""},{"old":"/dashboard/media/edit/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['media.edit']['types'],
  },
  'media.store': {
    methods: ["POST"],
    pattern: '/dashboard/media/store',
    tokens: [{"old":"/dashboard/media/store","type":0,"val":"dashboard","end":""},{"old":"/dashboard/media/store","type":0,"val":"media","end":""},{"old":"/dashboard/media/store","type":0,"val":"store","end":""}],
    types: placeholder as Registry['media.store']['types'],
  },
  'media.update': {
    methods: ["PATCH"],
    pattern: '/dashboard/media/update',
    tokens: [{"old":"/dashboard/media/update","type":0,"val":"dashboard","end":""},{"old":"/dashboard/media/update","type":0,"val":"media","end":""},{"old":"/dashboard/media/update","type":0,"val":"update","end":""}],
    types: placeholder as Registry['media.update']['types'],
  },
  'media.destroy': {
    methods: ["DELETE"],
    pattern: '/dashboard/media/delete/:id',
    tokens: [{"old":"/dashboard/media/delete/:id","type":0,"val":"dashboard","end":""},{"old":"/dashboard/media/delete/:id","type":0,"val":"media","end":""},{"old":"/dashboard/media/delete/:id","type":0,"val":"delete","end":""},{"old":"/dashboard/media/delete/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['media.destroy']['types'],
  },
  'media.bulkDestroy': {
    methods: ["DELETE"],
    pattern: '/dashboard/media/bulk-delete',
    tokens: [{"old":"/dashboard/media/bulk-delete","type":0,"val":"dashboard","end":""},{"old":"/dashboard/media/bulk-delete","type":0,"val":"media","end":""},{"old":"/dashboard/media/bulk-delete","type":0,"val":"bulk-delete","end":""}],
    types: placeholder as Registry['media.bulkDestroy']['types'],
  },
  'blog.index': {
    methods: ["GET","HEAD"],
    pattern: '/dashboard/blogs',
    tokens: [{"old":"/dashboard/blogs","type":0,"val":"dashboard","end":""},{"old":"/dashboard/blogs","type":0,"val":"blogs","end":""}],
    types: placeholder as Registry['blog.index']['types'],
  },
  'blog.create': {
    methods: ["GET","HEAD"],
    pattern: '/dashboard/blogs/create',
    tokens: [{"old":"/dashboard/blogs/create","type":0,"val":"dashboard","end":""},{"old":"/dashboard/blogs/create","type":0,"val":"blogs","end":""},{"old":"/dashboard/blogs/create","type":0,"val":"create","end":""}],
    types: placeholder as Registry['blog.create']['types'],
  },
  'blog.edit': {
    methods: ["GET","HEAD"],
    pattern: '/dashboard/blogs/edit/:id',
    tokens: [{"old":"/dashboard/blogs/edit/:id","type":0,"val":"dashboard","end":""},{"old":"/dashboard/blogs/edit/:id","type":0,"val":"blogs","end":""},{"old":"/dashboard/blogs/edit/:id","type":0,"val":"edit","end":""},{"old":"/dashboard/blogs/edit/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['blog.edit']['types'],
  },
  'blog.store': {
    methods: ["POST"],
    pattern: '/dashboard/blogs/store',
    tokens: [{"old":"/dashboard/blogs/store","type":0,"val":"dashboard","end":""},{"old":"/dashboard/blogs/store","type":0,"val":"blogs","end":""},{"old":"/dashboard/blogs/store","type":0,"val":"store","end":""}],
    types: placeholder as Registry['blog.store']['types'],
  },
  'blog.update': {
    methods: ["PATCH"],
    pattern: '/dashboard/blogs/update',
    tokens: [{"old":"/dashboard/blogs/update","type":0,"val":"dashboard","end":""},{"old":"/dashboard/blogs/update","type":0,"val":"blogs","end":""},{"old":"/dashboard/blogs/update","type":0,"val":"update","end":""}],
    types: placeholder as Registry['blog.update']['types'],
  },
  'blog.destroy': {
    methods: ["DELETE"],
    pattern: '/dashboard/blogs/delete/:id',
    tokens: [{"old":"/dashboard/blogs/delete/:id","type":0,"val":"dashboard","end":""},{"old":"/dashboard/blogs/delete/:id","type":0,"val":"blogs","end":""},{"old":"/dashboard/blogs/delete/:id","type":0,"val":"delete","end":""},{"old":"/dashboard/blogs/delete/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['blog.destroy']['types'],
  },
  'blog.bulkDestroy': {
    methods: ["DELETE"],
    pattern: '/dashboard/blogs/bulk-delete',
    tokens: [{"old":"/dashboard/blogs/bulk-delete","type":0,"val":"dashboard","end":""},{"old":"/dashboard/blogs/bulk-delete","type":0,"val":"blogs","end":""},{"old":"/dashboard/blogs/bulk-delete","type":0,"val":"bulk-delete","end":""}],
    types: placeholder as Registry['blog.bulkDestroy']['types'],
  },
  'blog.rollback': {
    methods: ["POST"],
    pattern: '/dashboard/blogs/rollback',
    tokens: [{"old":"/dashboard/blogs/rollback","type":0,"val":"dashboard","end":""},{"old":"/dashboard/blogs/rollback","type":0,"val":"blogs","end":""},{"old":"/dashboard/blogs/rollback","type":0,"val":"rollback","end":""}],
    types: placeholder as Registry['blog.rollback']['types'],
  },
  'blog.rollbackFields': {
    methods: ["POST"],
    pattern: '/dashboard/blogs/rollback-fields',
    tokens: [{"old":"/dashboard/blogs/rollback-fields","type":0,"val":"dashboard","end":""},{"old":"/dashboard/blogs/rollback-fields","type":0,"val":"blogs","end":""},{"old":"/dashboard/blogs/rollback-fields","type":0,"val":"rollback-fields","end":""}],
    types: placeholder as Registry['blog.rollbackFields']['types'],
  },
  'activity_log.index': {
    methods: ["GET","HEAD"],
    pattern: '/dashboard/activity-log',
    tokens: [{"old":"/dashboard/activity-log","type":0,"val":"dashboard","end":""},{"old":"/dashboard/activity-log","type":0,"val":"activity-log","end":""}],
    types: placeholder as Registry['activity_log.index']['types'],
  },
  'activity_log.clearRange': {
    methods: ["DELETE"],
    pattern: '/dashboard/activity-log/clear-range',
    tokens: [{"old":"/dashboard/activity-log/clear-range","type":0,"val":"dashboard","end":""},{"old":"/dashboard/activity-log/clear-range","type":0,"val":"activity-log","end":""},{"old":"/dashboard/activity-log/clear-range","type":0,"val":"clear-range","end":""}],
    types: placeholder as Registry['activity_log.clearRange']['types'],
  },
  'home': {
    methods: ["GET","HEAD"],
    pattern: '/',
    tokens: [{"old":"/","type":0,"val":"/","end":""}],
    types: placeholder as Registry['home']['types'],
  },
  'blog': {
    methods: ["GET","HEAD"],
    pattern: '/blog',
    tokens: [{"old":"/blog","type":0,"val":"blog","end":""}],
    types: placeholder as Registry['blog']['types'],
  },
  'blog.post': {
    methods: ["GET","HEAD"],
    pattern: '/blog/:segment',
    tokens: [{"old":"/blog/:segment","type":0,"val":"blog","end":""},{"old":"/blog/:segment","type":1,"val":"segment","end":""}],
    types: placeholder as Registry['blog.post']['types'],
  },
  'api.v1.media.redirect': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/public/media/redirect/:id',
    tokens: [{"old":"/api/v1/public/media/redirect/:id","type":0,"val":"api","end":""},{"old":"/api/v1/public/media/redirect/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/public/media/redirect/:id","type":0,"val":"public","end":""},{"old":"/api/v1/public/media/redirect/:id","type":0,"val":"media","end":""},{"old":"/api/v1/public/media/redirect/:id","type":0,"val":"redirect","end":""},{"old":"/api/v1/public/media/redirect/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['api.v1.media.redirect']['types'],
  },
  'api.v1.public.blog.search': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/public/blog/search',
    tokens: [{"old":"/api/v1/public/blog/search","type":0,"val":"api","end":""},{"old":"/api/v1/public/blog/search","type":0,"val":"v1","end":""},{"old":"/api/v1/public/blog/search","type":0,"val":"public","end":""},{"old":"/api/v1/public/blog/search","type":0,"val":"blog","end":""},{"old":"/api/v1/public/blog/search","type":0,"val":"search","end":""}],
    types: placeholder as Registry['api.v1.public.blog.search']['types'],
  },
  'api.v1.me.avatar': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/me/avatar',
    tokens: [{"old":"/api/v1/me/avatar","type":0,"val":"api","end":""},{"old":"/api/v1/me/avatar","type":0,"val":"v1","end":""},{"old":"/api/v1/me/avatar","type":0,"val":"me","end":""},{"old":"/api/v1/me/avatar","type":0,"val":"avatar","end":""}],
    types: placeholder as Registry['api.v1.me.avatar']['types'],
  },
  'api.v1.media.list': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/media',
    tokens: [{"old":"/api/v1/media","type":0,"val":"api","end":""},{"old":"/api/v1/media","type":0,"val":"v1","end":""},{"old":"/api/v1/media","type":0,"val":"media","end":""}],
    types: placeholder as Registry['api.v1.media.list']['types'],
  },
  'api.v1.media.upload': {
    methods: ["POST"],
    pattern: '/api/v1/media',
    tokens: [{"old":"/api/v1/media","type":0,"val":"api","end":""},{"old":"/api/v1/media","type":0,"val":"v1","end":""},{"old":"/api/v1/media","type":0,"val":"media","end":""}],
    types: placeholder as Registry['api.v1.media.upload']['types'],
  },
  'api.v1.media.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/media',
    tokens: [{"old":"/api/v1/media","type":0,"val":"api","end":""},{"old":"/api/v1/media","type":0,"val":"v1","end":""},{"old":"/api/v1/media","type":0,"val":"media","end":""}],
    types: placeholder as Registry['api.v1.media.destroy']['types'],
  },
  'api.v1.utils.random-password': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/utils/random-password',
    tokens: [{"old":"/api/v1/utils/random-password","type":0,"val":"api","end":""},{"old":"/api/v1/utils/random-password","type":0,"val":"v1","end":""},{"old":"/api/v1/utils/random-password","type":0,"val":"utils","end":""},{"old":"/api/v1/utils/random-password","type":0,"val":"random-password","end":""}],
    types: placeholder as Registry['api.v1.utils.random-password']['types'],
  },
  'api.v1.utils.link-metadata': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/utils/link-metadata',
    tokens: [{"old":"/api/v1/utils/link-metadata","type":0,"val":"api","end":""},{"old":"/api/v1/utils/link-metadata","type":0,"val":"v1","end":""},{"old":"/api/v1/utils/link-metadata","type":0,"val":"utils","end":""},{"old":"/api/v1/utils/link-metadata","type":0,"val":"link-metadata","end":""}],
    types: placeholder as Registry['api.v1.utils.link-metadata']['types'],
  },
  'auth.logout': {
    methods: ["POST"],
    pattern: '/auth/logout',
    tokens: [{"old":"/auth/logout","type":0,"val":"auth","end":""},{"old":"/auth/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['auth.logout']['types'],
  },
  'auth.login': {
    methods: ["GET","HEAD"],
    pattern: '/auth/login',
    tokens: [{"old":"/auth/login","type":0,"val":"auth","end":""},{"old":"/auth/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['auth.login']['types'],
  },
  'auth.login.post': {
    methods: ["POST"],
    pattern: '/auth/login',
    tokens: [{"old":"/auth/login","type":0,"val":"auth","end":""},{"old":"/auth/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['auth.login.post']['types'],
  },
  'auth.register': {
    methods: ["GET","HEAD"],
    pattern: '/auth/register',
    tokens: [{"old":"/auth/register","type":0,"val":"auth","end":""},{"old":"/auth/register","type":0,"val":"register","end":""}],
    types: placeholder as Registry['auth.register']['types'],
  },
  'auth.register.post': {
    methods: ["POST"],
    pattern: '/auth/register',
    tokens: [{"old":"/auth/register","type":0,"val":"auth","end":""},{"old":"/auth/register","type":0,"val":"register","end":""}],
    types: placeholder as Registry['auth.register.post']['types'],
  },
  'auth.requestResetPassword': {
    methods: ["GET","HEAD"],
    pattern: '/auth/reset-password',
    tokens: [{"old":"/auth/reset-password","type":0,"val":"auth","end":""},{"old":"/auth/reset-password","type":0,"val":"reset-password","end":""}],
    types: placeholder as Registry['auth.requestResetPassword']['types'],
  },
  'auth.requestResetPassword.post': {
    methods: ["POST"],
    pattern: '/auth/reset-password/request',
    tokens: [{"old":"/auth/reset-password/request","type":0,"val":"auth","end":""},{"old":"/auth/reset-password/request","type":0,"val":"reset-password","end":""},{"old":"/auth/reset-password/request","type":0,"val":"request","end":""}],
    types: placeholder as Registry['auth.requestResetPassword.post']['types'],
  },
  'auth.resetPassword': {
    methods: ["GET","HEAD"],
    pattern: '/auth/reset-password/:token',
    tokens: [{"old":"/auth/reset-password/:token","type":0,"val":"auth","end":""},{"old":"/auth/reset-password/:token","type":0,"val":"reset-password","end":""},{"old":"/auth/reset-password/:token","type":1,"val":"token","end":""}],
    types: placeholder as Registry['auth.resetPassword']['types'],
  },
  'auth.resetPassword.post': {
    methods: ["POST"],
    pattern: '/auth/reset-password',
    tokens: [{"old":"/auth/reset-password","type":0,"val":"auth","end":""},{"old":"/auth/reset-password","type":0,"val":"reset-password","end":""}],
    types: placeholder as Registry['auth.resetPassword.post']['types'],
  },
  'auth.verifyEmail': {
    methods: ["GET","HEAD"],
    pattern: '/auth/verify-email',
    tokens: [{"old":"/auth/verify-email","type":0,"val":"auth","end":""},{"old":"/auth/verify-email","type":0,"val":"verify-email","end":""}],
    types: placeholder as Registry['auth.verifyEmail']['types'],
  },
  'auth.verifyEmail.verify': {
    methods: ["GET","HEAD"],
    pattern: '/auth/verify-email/verify/:token',
    tokens: [{"old":"/auth/verify-email/verify/:token","type":0,"val":"auth","end":""},{"old":"/auth/verify-email/verify/:token","type":0,"val":"verify-email","end":""},{"old":"/auth/verify-email/verify/:token","type":0,"val":"verify","end":""},{"old":"/auth/verify-email/verify/:token","type":1,"val":"token","end":""}],
    types: placeholder as Registry['auth.verifyEmail.verify']['types'],
  },
  'auth.verifyEmail.request': {
    methods: ["POST"],
    pattern: '/auth/verify-email/request',
    tokens: [{"old":"/auth/verify-email/request","type":0,"val":"auth","end":""},{"old":"/auth/verify-email/request","type":0,"val":"verify-email","end":""},{"old":"/auth/verify-email/request","type":0,"val":"request","end":""}],
    types: placeholder as Registry['auth.verifyEmail.request']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
