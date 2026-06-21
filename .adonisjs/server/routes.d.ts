import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'dashboard.view': { paramsTuple?: []; params?: {} }
    'profile.view': { paramsTuple?: []; params?: {} }
    'profile.update': { paramsTuple?: []; params?: {} }
    'user.index': { paramsTuple?: []; params?: {} }
    'user.create': { paramsTuple?: []; params?: {} }
    'user.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'user.store': { paramsTuple?: []; params?: {} }
    'user.update': { paramsTuple?: []; params?: {} }
    'user.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'user.bulkDestroy': { paramsTuple?: []; params?: {} }
    'permission.index': { paramsTuple?: []; params?: {} }
    'permission.create': { paramsTuple?: []; params?: {} }
    'permission.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'permission.store': { paramsTuple?: []; params?: {} }
    'permission.update': { paramsTuple?: []; params?: {} }
    'permission.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'permission.bulkDestroy': { paramsTuple?: []; params?: {} }
    'role.index': { paramsTuple?: []; params?: {} }
    'role.create': { paramsTuple?: []; params?: {} }
    'role.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'role.store': { paramsTuple?: []; params?: {} }
    'role.update': { paramsTuple?: []; params?: {} }
    'role.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'role.bulkDestroy': { paramsTuple?: []; params?: {} }
    'media.index': { paramsTuple?: []; params?: {} }
    'media.create': { paramsTuple?: []; params?: {} }
    'media.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'media.store': { paramsTuple?: []; params?: {} }
    'media.update': { paramsTuple?: []; params?: {} }
    'media.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'media.bulkDestroy': { paramsTuple?: []; params?: {} }
    'blog.index': { paramsTuple?: []; params?: {} }
    'blog.create': { paramsTuple?: []; params?: {} }
    'blog.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'blog.store': { paramsTuple?: []; params?: {} }
    'blog.update': { paramsTuple?: []; params?: {} }
    'blog.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'blog.bulkDestroy': { paramsTuple?: []; params?: {} }
    'blog.rollback': { paramsTuple?: []; params?: {} }
    'blog.rollbackFields': { paramsTuple?: []; params?: {} }
    'activity_log.index': { paramsTuple?: []; params?: {} }
    'activity_log.clearRange': { paramsTuple?: []; params?: {} }
    'home': { paramsTuple?: []; params?: {} }
    'blog': { paramsTuple?: []; params?: {} }
    'blog.post': { paramsTuple: [ParamValue]; params: {'segment': ParamValue} }
    'api.v1.media.redirect': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.public.blog.search': { paramsTuple?: []; params?: {} }
    'api.v1.me.avatar': { paramsTuple?: []; params?: {} }
    'api.v1.media.list': { paramsTuple?: []; params?: {} }
    'api.v1.media.upload': { paramsTuple?: []; params?: {} }
    'api.v1.media.destroy': { paramsTuple?: []; params?: {} }
    'api.v1.utils.random-password': { paramsTuple?: []; params?: {} }
    'api.v1.utils.link-metadata': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'auth.login': { paramsTuple?: []; params?: {} }
    'auth.login.post': { paramsTuple?: []; params?: {} }
    'auth.register': { paramsTuple?: []; params?: {} }
    'auth.register.post': { paramsTuple?: []; params?: {} }
    'auth.requestResetPassword': { paramsTuple?: []; params?: {} }
    'auth.requestResetPassword.post': { paramsTuple?: []; params?: {} }
    'auth.resetPassword': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'auth.resetPassword.post': { paramsTuple?: []; params?: {} }
    'auth.verifyEmail': { paramsTuple?: []; params?: {} }
    'auth.verifyEmail.verify': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'auth.verifyEmail.request': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'dashboard.view': { paramsTuple?: []; params?: {} }
    'profile.view': { paramsTuple?: []; params?: {} }
    'user.index': { paramsTuple?: []; params?: {} }
    'user.create': { paramsTuple?: []; params?: {} }
    'user.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'permission.index': { paramsTuple?: []; params?: {} }
    'permission.create': { paramsTuple?: []; params?: {} }
    'permission.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'role.index': { paramsTuple?: []; params?: {} }
    'role.create': { paramsTuple?: []; params?: {} }
    'role.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'media.index': { paramsTuple?: []; params?: {} }
    'media.create': { paramsTuple?: []; params?: {} }
    'media.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'blog.index': { paramsTuple?: []; params?: {} }
    'blog.create': { paramsTuple?: []; params?: {} }
    'blog.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'activity_log.index': { paramsTuple?: []; params?: {} }
    'home': { paramsTuple?: []; params?: {} }
    'blog': { paramsTuple?: []; params?: {} }
    'blog.post': { paramsTuple: [ParamValue]; params: {'segment': ParamValue} }
    'api.v1.media.redirect': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.public.blog.search': { paramsTuple?: []; params?: {} }
    'api.v1.me.avatar': { paramsTuple?: []; params?: {} }
    'api.v1.media.list': { paramsTuple?: []; params?: {} }
    'api.v1.utils.random-password': { paramsTuple?: []; params?: {} }
    'api.v1.utils.link-metadata': { paramsTuple?: []; params?: {} }
    'auth.login': { paramsTuple?: []; params?: {} }
    'auth.register': { paramsTuple?: []; params?: {} }
    'auth.requestResetPassword': { paramsTuple?: []; params?: {} }
    'auth.resetPassword': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'auth.verifyEmail': { paramsTuple?: []; params?: {} }
    'auth.verifyEmail.verify': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
  }
  HEAD: {
    'drive.fs.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'dashboard.view': { paramsTuple?: []; params?: {} }
    'profile.view': { paramsTuple?: []; params?: {} }
    'user.index': { paramsTuple?: []; params?: {} }
    'user.create': { paramsTuple?: []; params?: {} }
    'user.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'permission.index': { paramsTuple?: []; params?: {} }
    'permission.create': { paramsTuple?: []; params?: {} }
    'permission.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'role.index': { paramsTuple?: []; params?: {} }
    'role.create': { paramsTuple?: []; params?: {} }
    'role.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'media.index': { paramsTuple?: []; params?: {} }
    'media.create': { paramsTuple?: []; params?: {} }
    'media.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'blog.index': { paramsTuple?: []; params?: {} }
    'blog.create': { paramsTuple?: []; params?: {} }
    'blog.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'activity_log.index': { paramsTuple?: []; params?: {} }
    'home': { paramsTuple?: []; params?: {} }
    'blog': { paramsTuple?: []; params?: {} }
    'blog.post': { paramsTuple: [ParamValue]; params: {'segment': ParamValue} }
    'api.v1.media.redirect': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.v1.public.blog.search': { paramsTuple?: []; params?: {} }
    'api.v1.me.avatar': { paramsTuple?: []; params?: {} }
    'api.v1.media.list': { paramsTuple?: []; params?: {} }
    'api.v1.utils.random-password': { paramsTuple?: []; params?: {} }
    'api.v1.utils.link-metadata': { paramsTuple?: []; params?: {} }
    'auth.login': { paramsTuple?: []; params?: {} }
    'auth.register': { paramsTuple?: []; params?: {} }
    'auth.requestResetPassword': { paramsTuple?: []; params?: {} }
    'auth.resetPassword': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'auth.verifyEmail': { paramsTuple?: []; params?: {} }
    'auth.verifyEmail.verify': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
  }
  PATCH: {
    'profile.update': { paramsTuple?: []; params?: {} }
    'user.update': { paramsTuple?: []; params?: {} }
    'permission.update': { paramsTuple?: []; params?: {} }
    'role.update': { paramsTuple?: []; params?: {} }
    'media.update': { paramsTuple?: []; params?: {} }
    'blog.update': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'user.store': { paramsTuple?: []; params?: {} }
    'permission.store': { paramsTuple?: []; params?: {} }
    'role.store': { paramsTuple?: []; params?: {} }
    'media.store': { paramsTuple?: []; params?: {} }
    'blog.store': { paramsTuple?: []; params?: {} }
    'blog.rollback': { paramsTuple?: []; params?: {} }
    'blog.rollbackFields': { paramsTuple?: []; params?: {} }
    'api.v1.media.upload': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'auth.login.post': { paramsTuple?: []; params?: {} }
    'auth.register.post': { paramsTuple?: []; params?: {} }
    'auth.requestResetPassword.post': { paramsTuple?: []; params?: {} }
    'auth.resetPassword.post': { paramsTuple?: []; params?: {} }
    'auth.verifyEmail.request': { paramsTuple?: []; params?: {} }
  }
  DELETE: {
    'user.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'user.bulkDestroy': { paramsTuple?: []; params?: {} }
    'permission.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'permission.bulkDestroy': { paramsTuple?: []; params?: {} }
    'role.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'role.bulkDestroy': { paramsTuple?: []; params?: {} }
    'media.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'media.bulkDestroy': { paramsTuple?: []; params?: {} }
    'blog.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'blog.bulkDestroy': { paramsTuple?: []; params?: {} }
    'activity_log.clearRange': { paramsTuple?: []; params?: {} }
    'api.v1.media.destroy': { paramsTuple?: []; params?: {} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}