/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  drive: {
    fs: {
      serve: typeof routes['drive.fs.serve']
    }
  }
  dashboard: {
    view: typeof routes['dashboard.view']
  }
  profile: {
    view: typeof routes['profile.view']
    update: typeof routes['profile.update']
  }
  user: {
    index: typeof routes['user.index']
    create: typeof routes['user.create']
    edit: typeof routes['user.edit']
    store: typeof routes['user.store']
    update: typeof routes['user.update']
    destroy: typeof routes['user.destroy']
    bulkDestroy: typeof routes['user.bulkDestroy']
  }
  permission: {
    index: typeof routes['permission.index']
    create: typeof routes['permission.create']
    edit: typeof routes['permission.edit']
    store: typeof routes['permission.store']
    update: typeof routes['permission.update']
    destroy: typeof routes['permission.destroy']
    bulkDestroy: typeof routes['permission.bulkDestroy']
  }
  role: {
    index: typeof routes['role.index']
    create: typeof routes['role.create']
    edit: typeof routes['role.edit']
    store: typeof routes['role.store']
    update: typeof routes['role.update']
    destroy: typeof routes['role.destroy']
    bulkDestroy: typeof routes['role.bulkDestroy']
  }
  media: {
    index: typeof routes['media.index']
    create: typeof routes['media.create']
    edit: typeof routes['media.edit']
    store: typeof routes['media.store']
    update: typeof routes['media.update']
    destroy: typeof routes['media.destroy']
    bulkDestroy: typeof routes['media.bulkDestroy']
  }
  blog: typeof routes['blog'] & {
    index: typeof routes['blog.index']
    create: typeof routes['blog.create']
    edit: typeof routes['blog.edit']
    store: typeof routes['blog.store']
    update: typeof routes['blog.update']
    destroy: typeof routes['blog.destroy']
    bulkDestroy: typeof routes['blog.bulkDestroy']
    rollback: typeof routes['blog.rollback']
    rollbackFields: typeof routes['blog.rollbackFields']
    post: typeof routes['blog.post']
  }
  activityLog: {
    index: typeof routes['activity_log.index']
    clearRange: typeof routes['activity_log.clearRange']
  }
  home: typeof routes['home']
  api: {
    v1: {
      media: {
        redirect: typeof routes['api.v1.media.redirect']
        list: typeof routes['api.v1.media.list']
        upload: typeof routes['api.v1.media.upload']
        destroy: typeof routes['api.v1.media.destroy']
      }
      public: {
        blog: {
          search: typeof routes['api.v1.public.blog.search']
        }
      }
      me: {
        avatar: typeof routes['api.v1.me.avatar']
      }
      utils: {
        randomPassword: typeof routes['api.v1.utils.random-password']
        linkMetadata: typeof routes['api.v1.utils.link-metadata']
      }
    }
  }
  auth: {
    logout: typeof routes['auth.logout']
    login: typeof routes['auth.login'] & {
      post: typeof routes['auth.login.post']
    }
    register: typeof routes['auth.register'] & {
      post: typeof routes['auth.register.post']
    }
    requestResetPassword: typeof routes['auth.requestResetPassword'] & {
      post: typeof routes['auth.requestResetPassword.post']
    }
    resetPassword: typeof routes['auth.resetPassword'] & {
      post: typeof routes['auth.resetPassword.post']
    }
    verifyEmail: typeof routes['auth.verifyEmail'] & {
      verify: typeof routes['auth.verifyEmail.verify']
      request: typeof routes['auth.verifyEmail.request']
    }
  }
}
