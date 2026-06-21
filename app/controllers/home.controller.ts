import BlogService from '#services/blog.service'
import { BlogTransformer } from '#transformers/blog.transformer'

import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class HomeController {
  constructor(protected blogSvc: BlogService) {}

  async view({ inertia }: HttpContext) {
    const blogs = await this.blogSvc.publicIndex({
      page: 1,
      perPage: 6,
      sortBy: 'created_at',
      sortDirection: 'desc',
      search: '',
    })

    return inertia.render('home', {
      latestBlogs: BlogTransformer.transform(blogs.all()),
    })
  }
}
