/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'drive.fs.serve': {
    methods: ["GET","HEAD"]
    pattern: '/uploads/*'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { '*': ParamValue[] }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'dashboard.view': {
    methods: ["GET","HEAD"]
    pattern: '/dashboard'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/dashboard.controller').default['view']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/dashboard.controller').default['view']>>>
    }
  }
  'profile.view': {
    methods: ["GET","HEAD"]
    pattern: '/dashboard/profile'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile.controller').default['view']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile.controller').default['view']>>>
    }
  }
  'profile.update': {
    methods: ["PATCH"]
    pattern: '/dashboard/profile'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/profile').updateProfileValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/profile').updateProfileValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile.controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile.controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'user.index': {
    methods: ["GET","HEAD"]
    pattern: '/dashboard/users'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/user.controller').default['viewList']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/user.controller').default['viewList']>>>
    }
  }
  'user.create': {
    methods: ["GET","HEAD"]
    pattern: '/dashboard/users/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/user.controller').default['viewCreate']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/user.controller').default['viewCreate']>>>
    }
  }
  'user.edit': {
    methods: ["GET","HEAD"]
    pattern: '/dashboard/users/edit/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/user.controller').default['viewEdit']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/user.controller').default['viewEdit']>>>
    }
  }
  'user.store': {
    methods: ["POST"]
    pattern: '/dashboard/users/store'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').createEditUserValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').createEditUserValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/user.controller').default['storeOrUpdate']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/user.controller').default['storeOrUpdate']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'user.update': {
    methods: ["PATCH"]
    pattern: '/dashboard/users/update'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').createEditUserValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').createEditUserValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/user.controller').default['storeOrUpdate']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/user.controller').default['storeOrUpdate']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'user.destroy': {
    methods: ["DELETE"]
    pattern: '/dashboard/users/delete/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/user.controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/user.controller').default['destroy']>>>
    }
  }
  'user.bulkDestroy': {
    methods: ["DELETE"]
    pattern: '/dashboard/users/bulk-delete'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/user.controller').default['bulkDestroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/user.controller').default['bulkDestroy']>>>
    }
  }
  'permission.index': {
    methods: ["GET","HEAD"]
    pattern: '/dashboard/permissions'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/permission.controller').default['viewList']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/permission.controller').default['viewList']>>>
    }
  }
  'permission.create': {
    methods: ["GET","HEAD"]
    pattern: '/dashboard/permissions/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/permission.controller').default['viewCreate']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/permission.controller').default['viewCreate']>>>
    }
  }
  'permission.edit': {
    methods: ["GET","HEAD"]
    pattern: '/dashboard/permissions/edit/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/permission.controller').default['viewEdit']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/permission.controller').default['viewEdit']>>>
    }
  }
  'permission.store': {
    methods: ["POST"]
    pattern: '/dashboard/permissions/store'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth/permission').createEditPermissionValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth/permission').createEditPermissionValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/permission.controller').default['storeOrUpdate']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/permission.controller').default['storeOrUpdate']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'permission.update': {
    methods: ["PATCH"]
    pattern: '/dashboard/permissions/update'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth/permission').createEditPermissionValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth/permission').createEditPermissionValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/permission.controller').default['storeOrUpdate']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/permission.controller').default['storeOrUpdate']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'permission.destroy': {
    methods: ["DELETE"]
    pattern: '/dashboard/permissions/delete/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/permission.controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/permission.controller').default['destroy']>>>
    }
  }
  'permission.bulkDestroy': {
    methods: ["DELETE"]
    pattern: '/dashboard/permissions/bulk-delete'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/permission.controller').default['bulkDestroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/permission.controller').default['bulkDestroy']>>>
    }
  }
  'role.index': {
    methods: ["GET","HEAD"]
    pattern: '/dashboard/roles'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/role.controller').default['viewList']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/role.controller').default['viewList']>>>
    }
  }
  'role.create': {
    methods: ["GET","HEAD"]
    pattern: '/dashboard/roles/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/role.controller').default['viewCreate']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/role.controller').default['viewCreate']>>>
    }
  }
  'role.edit': {
    methods: ["GET","HEAD"]
    pattern: '/dashboard/roles/edit/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/role.controller').default['viewEdit']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/role.controller').default['viewEdit']>>>
    }
  }
  'role.store': {
    methods: ["POST"]
    pattern: '/dashboard/roles/store'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth/role').createEditRoleValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth/role').createEditRoleValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/role.controller').default['storeOrUpdate']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/role.controller').default['storeOrUpdate']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'role.update': {
    methods: ["PATCH"]
    pattern: '/dashboard/roles/update'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth/role').createEditRoleValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth/role').createEditRoleValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/role.controller').default['storeOrUpdate']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/role.controller').default['storeOrUpdate']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'role.destroy': {
    methods: ["DELETE"]
    pattern: '/dashboard/roles/delete/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/role.controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/role.controller').default['destroy']>>>
    }
  }
  'role.bulkDestroy': {
    methods: ["DELETE"]
    pattern: '/dashboard/roles/bulk-delete'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/role.controller').default['bulkDestroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/role.controller').default['bulkDestroy']>>>
    }
  }
  'media.index': {
    methods: ["GET","HEAD"]
    pattern: '/dashboard/media'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/media.controller').default['viewList']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/media.controller').default['viewList']>>>
    }
  }
  'media.create': {
    methods: ["GET","HEAD"]
    pattern: '/dashboard/media/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/media.controller').default['viewCreate']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/media.controller').default['viewCreate']>>>
    }
  }
  'media.edit': {
    methods: ["GET","HEAD"]
    pattern: '/dashboard/media/edit/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/media.controller').default['viewEdit']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/media.controller').default['viewEdit']>>>
    }
  }
  'media.store': {
    methods: ["POST"]
    pattern: '/dashboard/media/store'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/media.controller').default['storeOrUpdate']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/media.controller').default['storeOrUpdate']>>>
    }
  }
  'media.update': {
    methods: ["PATCH"]
    pattern: '/dashboard/media/update'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/media.controller').default['storeOrUpdate']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/media.controller').default['storeOrUpdate']>>>
    }
  }
  'media.destroy': {
    methods: ["DELETE"]
    pattern: '/dashboard/media/delete/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/media.controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/media.controller').default['destroy']>>>
    }
  }
  'media.bulkDestroy': {
    methods: ["DELETE"]
    pattern: '/dashboard/media/bulk-delete'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/media.controller').default['bulkDestroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/media.controller').default['bulkDestroy']>>>
    }
  }
  'blog.index': {
    methods: ["GET","HEAD"]
    pattern: '/dashboard/blogs'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/blog.controller').default['viewList']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/blog.controller').default['viewList']>>>
    }
  }
  'blog.create': {
    methods: ["GET","HEAD"]
    pattern: '/dashboard/blogs/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/blog.controller').default['viewCreate']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/blog.controller').default['viewCreate']>>>
    }
  }
  'blog.edit': {
    methods: ["GET","HEAD"]
    pattern: '/dashboard/blogs/edit/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/blog.controller').default['viewEdit']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/blog.controller').default['viewEdit']>>>
    }
  }
  'blog.store': {
    methods: ["POST"]
    pattern: '/dashboard/blogs/store'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/blog').createEditBlogValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/blog').createEditBlogValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/blog.controller').default['storeOrUpdate']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/blog.controller').default['storeOrUpdate']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'blog.update': {
    methods: ["PATCH"]
    pattern: '/dashboard/blogs/update'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/blog').createEditBlogValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/blog').createEditBlogValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/blog.controller').default['storeOrUpdate']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/blog.controller').default['storeOrUpdate']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'blog.destroy': {
    methods: ["DELETE"]
    pattern: '/dashboard/blogs/delete/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/blog.controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/blog.controller').default['destroy']>>>
    }
  }
  'blog.bulkDestroy': {
    methods: ["DELETE"]
    pattern: '/dashboard/blogs/bulk-delete'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/blog.controller').default['bulkDestroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/blog.controller').default['bulkDestroy']>>>
    }
  }
  'blog.rollback': {
    methods: ["POST"]
    pattern: '/dashboard/blogs/rollback'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/blog.controller').default['rollbackRevision']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/blog.controller').default['rollbackRevision']>>>
    }
  }
  'blog.rollbackFields': {
    methods: ["POST"]
    pattern: '/dashboard/blogs/rollback-fields'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/blog.controller').default['rollbackRevisionFields']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/blog.controller').default['rollbackRevisionFields']>>>
    }
  }
  'activity_log.index': {
    methods: ["GET","HEAD"]
    pattern: '/dashboard/activity-log'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/activity_log.controller').default['viewList']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/activity_log.controller').default['viewList']>>>
    }
  }
  'activity_log.clearRange': {
    methods: ["DELETE"]
    pattern: '/dashboard/activity-log/clear-range'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/activity_log').clearActivityLogRangeValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/activity_log').clearActivityLogRangeValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/activity_log.controller').default['clearRange']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/activity_log.controller').default['clearRange']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'home': {
    methods: ["GET","HEAD"]
    pattern: '/'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/home.controller').default['view']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/home.controller').default['view']>>>
    }
  }
  'blog': {
    methods: ["GET","HEAD"]
    pattern: '/blog'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/blog_public.controller').default['view']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/blog_public.controller').default['view']>>>
    }
  }
  'blog.post': {
    methods: ["GET","HEAD"]
    pattern: '/blog/:segment'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { segment: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/blog_public.controller').default['viewPost']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/blog_public.controller').default['viewPost']>>>
    }
  }
  'api.v1.media.redirect': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/public/media/redirect/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/media.controller').default['redirectMediaAPI']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/media.controller').default['redirectMediaAPI']>>>
    }
  }
  'api.v1.public.blog.search': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/public/blog/search'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/blog_public.controller').default['searchAPI']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/blog_public.controller').default['searchAPI']>>>
    }
  }
  'api.v1.me.avatar': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/me/avatar'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile.controller').default['getAvatarAPI']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile.controller').default['getAvatarAPI']>>>
    }
  }
  'api.v1.media.list': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/media'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/media.controller').default['getMediaListAPI']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/media.controller').default['getMediaListAPI']>>>
    }
  }
  'api.v1.media.upload': {
    methods: ["POST"]
    pattern: '/api/v1/media'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/media').mediaImportUrlAPIValidator)>|InferInput<(typeof import('#validators/media').mediaUploadAPIValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/media').mediaImportUrlAPIValidator)>|InferInput<(typeof import('#validators/media').mediaUploadAPIValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/media.controller').default['uploadMediaAPI']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/media.controller').default['uploadMediaAPI']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.v1.media.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/media'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/media.controller').default['deleteMediaAPI']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/media.controller').default['deleteMediaAPI']>>>
    }
  }
  'api.v1.utils.random-password': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/utils/random-password'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/utils.controller').default['generateRandomPassword']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/utils.controller').default['generateRandomPassword']>>>
    }
  }
  'api.v1.utils.link-metadata': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/utils/link-metadata'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/utils.controller').default['getLinkMetadata']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/utils.controller').default['getLinkMetadata']>>>
    }
  }
  'auth.logout': {
    methods: ["POST"]
    pattern: '/auth/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth.controller').default['logout']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth.controller').default['logout']>>>
    }
  }
  'auth.login': {
    methods: ["GET","HEAD"]
    pattern: '/auth/login'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth.controller').default['viewLogin']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth.controller').default['viewLogin']>>>
    }
  }
  'auth.login.post': {
    methods: ["POST"]
    pattern: '/auth/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth/auth').loginValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth/auth').loginValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth.controller').default['login']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth.controller').default['login']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.register': {
    methods: ["GET","HEAD"]
    pattern: '/auth/register'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth.controller').default['viewRegister']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth.controller').default['viewRegister']>>>
    }
  }
  'auth.register.post': {
    methods: ["POST"]
    pattern: '/auth/register'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth/auth').registerValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth/auth').registerValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth.controller').default['register']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth.controller').default['register']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.requestResetPassword': {
    methods: ["GET","HEAD"]
    pattern: '/auth/reset-password'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth.controller').default['viewRequestResetPassword']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth.controller').default['viewRequestResetPassword']>>>
    }
  }
  'auth.requestResetPassword.post': {
    methods: ["POST"]
    pattern: '/auth/reset-password/request'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth/auth').askResetPasswordValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth/auth').askResetPasswordValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth.controller').default['requestResetPassword']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth.controller').default['requestResetPassword']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.resetPassword': {
    methods: ["GET","HEAD"]
    pattern: '/auth/reset-password/:token'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { token: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth.controller').default['viewResetPassword']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth.controller').default['viewResetPassword']>>>
    }
  }
  'auth.resetPassword.post': {
    methods: ["POST"]
    pattern: '/auth/reset-password'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth/auth').resetPasswordValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth/auth').resetPasswordValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth.controller').default['resetPassword']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth.controller').default['resetPassword']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.verifyEmail': {
    methods: ["GET","HEAD"]
    pattern: '/auth/verify-email'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth.controller').default['viewVerifyEmail']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth.controller').default['viewVerifyEmail']>>>
    }
  }
  'auth.verifyEmail.verify': {
    methods: ["GET","HEAD"]
    pattern: '/auth/verify-email/verify/:token'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { token: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth.controller').default['verifyEmail']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth.controller').default['verifyEmail']>>>
    }
  }
  'auth.verifyEmail.request': {
    methods: ["POST"]
    pattern: '/auth/verify-email/request'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth/auth').askEmailVerifyValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth/auth').askEmailVerifyValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth.controller').default['requestVerifyEmail']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth.controller').default['requestVerifyEmail']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
}
