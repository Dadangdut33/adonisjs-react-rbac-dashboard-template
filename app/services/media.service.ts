import Media from '#models/media'
import MediaRepository from '#repositories/media.repository'

import { inject } from '@adonisjs/core'
import { MultipartFile } from '@adonisjs/core/bodyparser'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

@inject()
export default class MediaService {
  constructor(protected repo: MediaRepository) {}

  async replace(
    file: MultipartFile,
    opts: { media?: Media; keyPrefix: string; onDupe?: 'add' | 'use_old' },
    trx?: TransactionClientContract
  ) {
    return this.repo.replace(file, opts, trx)
  }

  async replaceById(
    file: MultipartFile,
    opts: { id?: string | null; keyPrefix: string; onDupe?: 'add' | 'use_old' },
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
    { keyPrefix, onDupe = 'add' }: { keyPrefix: string; onDupe?: 'add' | 'use_old' },
    trx?: TransactionClientContract
  ): Promise<Media> {
    return this.repo.upload(file, { keyPrefix, onDupe }, trx)
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
}
