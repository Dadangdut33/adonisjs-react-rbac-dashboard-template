import { normalizeRteMediaUrlsForSave } from '#lib/rte_media_url'
import { buildBlogUrlPath, toSafeSlug } from '#lib/url_slug'
import Blog from '#models/blog'
import BlogRepository, {
  BlogUpsertPayload,
  RevertableBlogField,
} from '#repositories/blog.repository'
import { QueryBuilderParams } from '#types/app'

import { inject } from '@adonisjs/core'

@inject()
export default class BlogService {
  constructor(protected repo: BlogRepository) {}

  async index(queryParams: QueryBuilderParams<typeof Blog>) {
    const preload = queryParams.preload ? [...queryParams.preload] : []
    if (!preload.includes('tags')) preload.push('tags')
    if (!preload.includes('thumbnail')) preload.push('thumbnail')
    if (!preload.includes('author')) preload.push('author')
    if (!preload.includes('editor')) preload.push('editor')
    const exclude = Array.from(new Set([...(queryParams.exclude || []), 'content']))

    const q = this.repo.query({
      ...queryParams,
      preload,
      exclude,
    })
    q.preload('author', (authorQuery) => authorQuery.preload('profile'))
    q.preload('editor', (editorQuery) => editorQuery.preload('profile'))

    return await this.repo.paginate(q, queryParams)
  }

  async publicIndex({
    search = '',
    page = 1,
    perPage = 12,
    sortBy = 'created_at',
    sortDirection = 'desc',
    includeInactive = false,
  }: {
    search?: string
    page?: number
    perPage?: number
    sortBy?: 'created_at' | 'updated_at'
    sortDirection?: 'asc' | 'desc'
    includeInactive?: boolean
  }) {
    const q = this.repo.query({
      page,
      perPage,
      search: search.trim(),
      filters: includeInactive ? undefined : { is_active: true },
      preload: ['thumbnail', 'tags'],
      searchableCol: ['title', 'description', 'slug_id'],
      searchRelations: [{ relation: 'tags', columns: ['name'] }],
      exclude: ['content'],
    })
    q.preload('author', (authorQuery) => authorQuery.preload('profile'))
    q.preload('editor', (editorQuery) => editorQuery.preload('profile'))

    // Always prioritize featured posts, then apply selected sort.
    q.orderBy('is_pinned', 'desc').orderBy(sortBy, sortDirection)

    return this.repo.paginate(q, { page, perPage })
  }

  async publicSearchSuggestions({
    search = '',
    limit = 8,
    includeInactive = false,
  }: {
    search?: string
    limit?: number
    includeInactive?: boolean
  }) {
    const keyword = search.trim()
    if (!keyword) return []

    const q = this.repo.query({
      search: keyword,
      filters: includeInactive ? undefined : { is_active: true },
      searchableCol: ['title', 'description', 'slug_id'],
      select: ['id', 'title', 'slug_id', 'description', 'updated_at'],
    })

    q.orderBy('is_pinned', 'desc')
      .orderBy('updated_at', 'desc')
      .limit(Math.min(Math.max(limit, 1), 20))

    const rows = await q
    return rows.map((item) => ({
      id: item.id,
      title: item.title,
      slug_id: item.slug_id,
      description: item.description,
      url_path: buildBlogUrlPath(item.title, item.slug_id),
      updated_at: item.updated_at,
    }))
  }

  async publicFindBySegment(segment: string, includeInactive = false) {
    const normalized = segment.trim()
    if (!normalized) return null

    const query = this.repo.model.query()
    if (!includeInactive) query.where('is_active', true)

    const blog = await query
      .whereRaw("? LIKE '%' || slug_id", [normalized])
      .preload('thumbnail')
      .preload('tags')
      .preload('author', (authorQuery) => authorQuery.preload('profile'))
      .preload('editor', (editorQuery) => editorQuery.preload('profile'))
      .first()

    if (!blog) return null

    const canonicalSegment = `${toSafeSlug(blog.title)}-${blog.slug_id}`
    const canonicalPath = buildBlogUrlPath(blog.title, blog.slug_id)

    return {
      blog,
      canonicalSegment,
      canonicalPath,
      isCanonical: normalized === canonicalSegment,
    }
  }

  async createUpdate(data: BlogUpsertPayload, actorId?: string) {
    return this.repo.updateOrCreateBlog({
      ...data,
      ...(actorId ? { actor_id: actorId } : {}),
      content: data.content ? normalizeRteMediaUrlsForSave(data.content) : data.content,
    })
  }

  async findOrFail(id: string) {
    return this.repo.findOrFail(id)
  }

  async findByIds(ids: string[]) {
    return this.repo.model.query().whereIn('id', ids)
  }

  async versions(blogId: string) {
    return this.repo.getVersions(blogId)
  }

  async revertToRevision(blogId: string, revisionId: string, actorId?: string) {
    return this.repo.revertToRevision(blogId, revisionId, actorId)
  }

  async revertFieldsToRevision(
    blogId: string,
    revisionId: string,
    fields: RevertableBlogField[],
    actorId?: string
  ) {
    return this.repo.revertFieldsToRevision(blogId, revisionId, fields, actorId)
  }

  async deleteRevision(blogId: string, revisionId: string) {
    return this.repo.deleteRevision(blogId, revisionId)
  }

  async delete(id: any) {
    return await this.repo.deleteBlog(String(id))
  }

  async deleteBlogs(ids: string[]) {
    for (const id of ids) {
      await this.repo.deleteBlog(id)
    }

    return true
  }
}
