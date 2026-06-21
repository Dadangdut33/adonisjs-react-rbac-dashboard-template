import Tables from '#enums/tables'
import Tag from '#models/tag'

import type { TransactionClientContract } from '@adonisjs/lucid/types/database'

import BaseRepository from './_base_repository.js'

export type TagType = 'blog' | 'media'

export default class TagRepository extends BaseRepository<typeof Tag> {
  constructor() {
    super(Tag)
  }

  async cleanupUnusedTags(type: TagType, trx?: TransactionClientContract) {
    let query = this.model.query({ client: trx }).where('type', type)

    if (type === 'blog') {
      query = query
        .whereNotExists((subQuery) => {
          subQuery
            .from(Tables.BLOG_TAGS)
            .whereRaw(`${Tables.BLOG_TAGS}.tag_id = ${Tables.TAGS}.id`)
            .select(1)
        })
        .whereNotExists((subQuery) => {
          subQuery
            .from(Tables.BLOG_VERSION_TAGS)
            .whereRaw(`${Tables.BLOG_VERSION_TAGS}.tag_id = ${Tables.TAGS}.id`)
            .select(1)
        })
    }

    if (type === 'media') {
      query = query
        .whereNotExists((subQuery) => {
          subQuery
            .from(Tables.MEDIA_TAGS)
            .whereRaw(`${Tables.MEDIA_TAGS}.tag_id = ${Tables.TAGS}.id`)
            .select(1)
        })
        .whereNotExists((subQuery) => {
          subQuery
            .from(Tables.ROLE_MEDIA_TAGS)
            .whereRaw(`${Tables.ROLE_MEDIA_TAGS}.tag_id = ${Tables.TAGS}.id`)
            .select(1)
        })
    }

    return query.delete()
  }
}
