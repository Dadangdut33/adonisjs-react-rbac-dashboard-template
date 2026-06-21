/* eslint-disable @typescript-eslint/naming-convention */
import Blog from '#models/blog'
import type BlogVersion from '#models/blog_version'
import Tag from '#models/tag'
import BlogVersionRepository from '#repositories/blog_version.repository'
import TagRepository from '#repositories/tag.repository'

import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'

import BaseRepository from './_base_repository.js'

const MAX_STORED_REVISIONS = 25
const BLOG_TAG_TYPE = 'blog'

export type BlogUpsertPayload = {
  id?: string
  slug_id?: string
  title?: string
  is_active?: boolean
  is_pinned?: boolean
  thumbnail_id?: string | null
  description?: string | null
  content?: Record<string, any>
  tags?: string[] | null
  actor_id?: string
}

export type RevertableBlogField =
  | 'title'
  | 'is_active'
  | 'is_pinned'
  | 'thumbnail_id'
  | 'description'
  | 'content'
  | 'tags'

export default class BlogRepository extends BaseRepository<typeof Blog> {
  protected versionRepo: BlogVersionRepository
  protected tagRepo: TagRepository

  constructor() {
    super(Blog)
    this.versionRepo = new BlogVersionRepository()
    this.tagRepo = new TagRepository()
  }

  /**
   * Normalize tag input so all write paths use consistent values.
   * - undefined  : do not change tags
   * - null       : clear all tags
   * - string[]   : trim, remove empty, remove duplicates
   */
  private normalizeTags(tags: string[] | null | undefined) {
    if (tags === undefined) return undefined
    if (tags === null) return []

    const normalized = tags
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
      .filter((value, index, self) => self.indexOf(value) === index)

    return normalized
  }

  private sameTags(left: string[], right: string[]) {
    if (left.length !== right.length) return false

    const leftSorted = [...left].sort()
    const rightSorted = [...right].sort()
    return leftSorted.every((value, index) => value === rightSorted[index])
  }

  /**
   * Ensure every tag exists exactly once globally.
   * Existing tags are reused, missing tags are created.
   */
  private async ensureTagIds(tagNames: string[], trx: TransactionClientContract) {
    if (tagNames.length === 0) return []

    const existingTags = await Tag.query({ client: trx })
      .where('type', BLOG_TAG_TYPE)
      .whereIn('name', tagNames)
    const tagIdByName = new Map(existingTags.map((tag) => [tag.name, tag.id]))

    for (const tagName of tagNames) {
      if (tagIdByName.has(tagName)) continue

      const tag = await Tag.create({ name: tagName, type: BLOG_TAG_TYPE }, { client: trx })
      tagIdByName.set(tagName, tag.id)
    }

    return tagNames.map((tagName) => tagIdByName.get(tagName)!).filter(Boolean)
  }

  /**
   * Convert persisted tag relation to a plain tag-name array.
   */
  private async getBlogTagNames(blog: Blog, trx: TransactionClientContract) {
    const tagRows = await blog.related('tags').query().useTransaction(trx).orderBy('name')
    return tagRows.map((item) => item.name)
  }

  /**
   * Creates a version snapshot and enforces retention limit.
   */
  private async createVersionSnapshot(
    blog: Blog,
    isCreate: boolean,
    changedFields: string[],
    trx: TransactionClientContract
  ) {
    const currentTagRows = await blog.related('tags').query().useTransaction(trx).orderBy('name')
    const tagIds = currentTagRows.map((item) => item.id)

    const nextVersion = await this.versionRepo.getNextVersion(blog.id, trx)

    const blogVersion = await this.versionRepo.model.create(
      {
        blog_id: blog.id,
        version: nextVersion,
        change_type: isCreate ? 'create' : 'update',
        slug_id: blog.slug_id,
        title: blog.title,
        is_active: blog.is_active,
        is_pinned: blog.is_pinned,
        thumbnail_id: blog.thumbnail_id,
        description: blog.description,
        author_id: blog.author_id,
        editor_id: blog.editor_id,
        content: blog.content,
        changed_fields: changedFields,
      },
      { client: trx }
    )

    if (tagIds.length > 0) {
      await blogVersion.related('tags').sync(tagIds)
    }

    await this.pruneOldRevisions(blog.id, MAX_STORED_REVISIONS, trx)

    return blogVersion
  }

  /**
   * Keeps only the latest N revisions by version number.
   */
  private async pruneOldRevisions(blogId: string, max: number, trx: TransactionClientContract) {
    const total = await this.versionRepo.model
      .query({ client: trx })
      .where('blog_id', blogId)
      .count('* as total')
      .first()

    const totalCount = Number(total?.$extras.total ?? 0)
    if (totalCount <= max) return

    const toDelete = totalCount - max
    const oldRows = await this.versionRepo.model
      .query({ client: trx })
      .where('blog_id', blogId)
      .orderBy('version', 'asc')
      .limit(toDelete)

    const oldIds = oldRows.map((row) => row.id)
    if (oldIds.length === 0) return

    await this.versionRepo.model.query({ client: trx }).whereIn('id', oldIds).delete()
    await this.tagRepo.cleanupUnusedTags(BLOG_TAG_TYPE, trx)
  }

  /**
   * Returns a revision and guarantees it belongs to the requested blog.
   */
  private async getRevisionOrFail(
    blogId: string,
    revisionId: string,
    trx?: TransactionClientContract
  ) {
    const revision = await this.versionRepo.model
      .query({ client: trx })
      .where('id', revisionId)
      .where('blog_id', blogId)
      .preload('tags')
      .first()

    if (!revision) throw new Error('Blog revision not found')
    return revision
  }

  /**
   * Build reusable payload from revision snapshot.
   */
  private mapRevisionToPayload(revision: BlogVersion): Omit<BlogUpsertPayload, 'id'> {
    return {
      slug_id: revision.slug_id,
      title: revision.title,
      is_active: revision.is_active,
      is_pinned: revision.is_pinned,
      thumbnail_id: revision.thumbnail_id,
      description: revision.description,
      content: revision.content,
      tags: revision.tags.map((item) => item.name),
    }
  }

  async updateOrCreateBlog(data: BlogUpsertPayload) {
    const { id, tags, actor_id, ...rest } = data
    const normalizedTags = this.normalizeTags(tags)
    const trx = await db.transaction()

    try {
      let blog = id ? await this.model.query({ client: trx }).where('id', id).first() : null
      const isCreate = !blog
      const originalValue = blog ? { ...blog.$attributes } : null
      const originalTags = blog ? await this.getBlogTagNames(blog, trx) : []

      if (blog) {
        blog.useTransaction(trx)
        blog.merge({
          ...rest,
          ...(actor_id ? { editor_id: actor_id } : {}),
        })
        await blog.save()
      } else {
        const createPayload = {
          is_active: true,
          is_pinned: false,
          ...(actor_id ? { author_id: actor_id, editor_id: actor_id } : {}),
          ...rest,
        }
        blog = new Blog()
        blog.useTransaction(trx)
        blog.fill(createPayload)
        await blog.save()
      }

      if (normalizedTags !== undefined) {
        const tagIds = await this.ensureTagIds(normalizedTags, trx)
        await blog.related('tags').sync(tagIds)
      }

      const changedFields = isCreate
        ? [
            ...Object.keys(rest),
            ...(actor_id ? ['author_id', 'editor_id'] : []),
            ...(normalizedTags !== undefined ? ['tags'] : []),
          ]
        : Object.entries(rest)
            .filter(
              ([key, value]) =>
                JSON.stringify((originalValue as any)[key]) !== JSON.stringify(value)
            )
            .map(([key]) => key)
            .concat(
              normalizedTags !== undefined && !this.sameTags(originalTags, normalizedTags)
                ? ['tags']
                : []
            )
            .concat(
              actor_id !== undefined && actor_id !== (originalValue as any)?.editor_id
                ? ['editor_id']
                : []
            )

      await this.createVersionSnapshot(blog, isCreate, changedFields, trx)
      await this.tagRepo.cleanupUnusedTags(BLOG_TAG_TYPE, trx)

      await trx.commit()
      await blog.load('tags')
      return blog
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  async revertToRevision(blogId: string, revisionId: string, actorId?: string) {
    const revision = await this.getRevisionOrFail(blogId, revisionId)
    const payload = this.mapRevisionToPayload(revision)

    // Goes through normal update pipeline so it creates a new revision entry.
    return this.updateOrCreateBlog({
      id: blogId,
      ...(actorId ? { actor_id: actorId } : {}),
      ...payload,
    })
  }

  async revertFieldsToRevision(
    blogId: string,
    revisionId: string,
    fields: RevertableBlogField[],
    actorId?: string
  ) {
    if (!fields || fields.length === 0) {
      const blog = await this.model.findOrFail(blogId)
      await blog.load('tags')
      return blog
    }

    const revision = await this.getRevisionOrFail(blogId, revisionId)
    const snapshot = this.mapRevisionToPayload(revision)

    const partialPayload: BlogUpsertPayload = { id: blogId }
    for (const field of fields) {
      if (field === 'title') partialPayload.title = snapshot.title
      if (field === 'is_active') partialPayload.is_active = snapshot.is_active
      if (field === 'is_pinned') partialPayload.is_pinned = snapshot.is_pinned
      if (field === 'thumbnail_id') partialPayload.thumbnail_id = snapshot.thumbnail_id
      if (field === 'description') partialPayload.description = snapshot.description
      if (field === 'content') partialPayload.content = snapshot.content
      if (field === 'tags') partialPayload.tags = snapshot.tags
    }

    // Reuses update flow so versioning, tags, and pruning stay consistent.
    return this.updateOrCreateBlog({
      ...partialPayload,
      ...(actorId ? { actor_id: actorId } : {}),
    })
  }

  async deleteRevision(blogId: string, revisionId: string) {
    const revision = await this.getRevisionOrFail(blogId, revisionId)
    await revision.delete()
    await this.tagRepo.cleanupUnusedTags(BLOG_TAG_TYPE)
  }

  async deleteBlog(id: string) {
    const trx = await db.transaction()

    try {
      const blog = await this.model.findOrFail(id)
      blog.useTransaction(trx)
      await blog.delete()

      await this.tagRepo.cleanupUnusedTags(BLOG_TAG_TYPE, trx)
      await trx.commit()
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  async getVersions(blogId: string) {
    return this.versionRepo.model
      .query()
      .where('blog_id', blogId)
      .preload('tags')
      .preload('author', (authorQuery) => authorQuery.preload('profile'))
      .preload('editor', (editorQuery) => editorQuery.preload('profile'))
      .orderBy('version', 'desc')
  }
}
