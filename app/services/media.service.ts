import Media from '#models/media'
import MediaRepository from '#repositories/media.repository'
import { QueryBuilderParams } from '#types/app'

import { inject } from '@adonisjs/core'
import { MultipartFile } from '@adonisjs/core/bodyparser'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

@inject()
export default class MediaService {
  constructor(protected repo: MediaRepository) {}

  async index(queryParams: QueryBuilderParams<typeof Media>) {
    const q = this.repo.query(queryParams)
    return await this.repo.paginate(q, queryParams)
  }

  async replace(
    file: MultipartFile,
    opts: { media?: Media; keyPrefix: string; onDupe?: 'add' | 'use_old'; tags?: string[] },
    trx?: TransactionClientContract
  ) {
    return this.repo.replace(file, opts, trx)
  }

  async replaceById(
    file: MultipartFile,
    opts: { id?: string | null; keyPrefix: string; onDupe?: 'add' | 'use_old'; tags?: string[] },
    trx?: TransactionClientContract
  ) {
    return this.repo.replaceById(file, opts, trx)
  }

  /**
   * Upload the file to the drive.
   *
   * onDupe behavior:
   * - 'add': Always store a new physical file, even if an identical hash exists.
   *   This is the safest default because each media record owns its file and
   *   deletion cannot affect other references.
   *
   * - 'use_old': Reuse an existing media record with the same content hash.
   *   This reduces storage duplication but should only be used when media is
   *   immutable and deletion semantics are well-defined (e.g. soft-delete or
   *   reference-counted).
   *
   * The default is 'add' to avoid accidental data loss from shared files.
   */
  async upload(
    file: MultipartFile,
    {
      keyPrefix,
      onDupe = 'add',
      tags,
    }: { keyPrefix: string; onDupe?: 'add' | 'use_old'; tags?: string[] },
    trx?: TransactionClientContract
  ): Promise<Media> {
    return this.repo.upload(file, { keyPrefix, onDupe, tags }, trx)
  }

  async getMediaURL(media: Media) {
    return this.repo.getMediaURL(media)
  }

  async getMediaURLById(id: string) {
    return this.repo.getMediaURLById(id)
  }

  async getMediaURLByKey(key: string) {
    return this.repo.getMediaURLByKey(key)
  }

  async delete(id: string) {
    return this.repo.deleteById(id)
  }

  async deleteBulk(ids: string[]) {
    // We do one by one to ensure file deletion on drive
    // optimizations can be done later if needed
    for (const id of ids) {
      await this.repo.deleteById(id)
    }

    return true
  }
}
