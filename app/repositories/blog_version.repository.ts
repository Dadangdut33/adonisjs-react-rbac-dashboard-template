import BlogVersion from '#models/blog_version'

import type { TransactionClientContract } from '@adonisjs/lucid/types/database'

import BaseRepository from './_base_repository.js'

export default class BlogVersionRepository extends BaseRepository<typeof BlogVersion> {
  constructor() {
    super(BlogVersion)
  }

  async getNextVersion(blog_id: string, trx?: TransactionClientContract) {
    const maxVersion = await this.model
      .query({ client: trx })
      .where('blog_id', blog_id)
      .max('version as max_version')
      .first()

    const currentMaxVersion = Number(maxVersion?.$extras.max_version ?? 0)
    return currentMaxVersion + 1
  }
}
