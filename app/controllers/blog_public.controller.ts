import { throwNotFound } from '#lib/utils'
import BlogService from '#services/blog.service'
import PermissionCheckService from '#services/permission_check.service'
import { BlogTransformer } from '#transformers/blog.transformer'
import { PaginationMeta } from '#types/app'

import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'

type BlogSort = 'created_desc' | 'created_asc' | 'updated_desc' | 'updated_asc'

@inject()
export default class BlogPublicController {
  constructor(
    protected blogSvc: BlogService,
    protected permCheckSvc: PermissionCheckService
  ) {}

  private async canPreviewInactive(auth: HttpContext['auth']) {
    if (!(await auth.check())) return false
    const user = auth.user
    if (!user) return false

    return (
      (await this.permCheckSvc.check(user, 'blog.create')) ||
      (await this.permCheckSvc.check(user, 'blog.update'))
    )
  }

  private resolveSort(sort: string | undefined): {
    sort: BlogSort
    sortBy: 'created_at' | 'updated_at'
    sortDirection: 'asc' | 'desc'
  } {
    const value = (sort || 'created_desc') as BlogSort

    switch (value) {
      case 'created_asc':
        return { sort: 'created_asc', sortBy: 'created_at', sortDirection: 'asc' }
      case 'updated_desc':
        return { sort: 'updated_desc', sortBy: 'updated_at', sortDirection: 'desc' }
      case 'updated_asc':
        return { sort: 'updated_asc', sortBy: 'updated_at', sortDirection: 'asc' }
      case 'created_desc':
      default:
        return { sort: 'created_desc', sortBy: 'created_at', sortDirection: 'desc' }
    }
  }

  async view({ inertia, request, auth }: HttpContext) {
    const search = String(request.input('search', '')).trim()
    const page = Math.max(Number(request.input('page', 1)) || 1, 1)
    const requestedPerPage = Number(request.input('per_page', 12)) || 12
    const perPage = Math.min(Math.max(requestedPerPage, 6), 24)
    const sortInput = String(request.input('sort', 'created_desc'))
    const { sort, sortBy, sortDirection } = this.resolveSort(sortInput)

    const includeInactive = await this.canPreviewInactive(auth)

    const data = await this.blogSvc.publicIndex({
      search,
      page,
      perPage,
      sortBy,
      sortDirection,
      includeInactive,
    })

    return inertia.render('blog/index', {
      data: BlogTransformer.transform(data.all()),
      meta: data.getMeta() as PaginationMeta,
      filters: {
        search,
        sort,
        per_page: perPage,
      },
    })
  }

  async searchAPI({ request, response, auth }: HttpContext) {
    const search = String(request.input('q', '')).trim()
    const limit = Math.min(Math.max(Number(request.input('limit', 8)) || 8, 1), 20)
    const includeInactive = await this.canPreviewInactive(auth)

    const data = await this.blogSvc.publicSearchSuggestions({
      search,
      limit,
      includeInactive,
    })

    return response.ok({
      status: 'success',
      message: 'Blog search fetched',
      data,
    })
  }

  async viewPost({ inertia, params, response, auth }: HttpContext) {
    const segment = String(params.segment || '').trim()
    if (!segment) return throwNotFound()

    const includeInactive = await this.canPreviewInactive(auth)
    const detail = await this.blogSvc.publicFindBySegment(segment, includeInactive)
    if (!detail) return throwNotFound()

    if (!detail.isCanonical) {
      return response.redirect(detail.canonicalPath)
    }

    return inertia.render('blog/post', {
      data: BlogTransformer.transform(detail.blog),
    })
  }
}
