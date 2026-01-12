import Media from '#models/media'
import env from '#start/env'

import { MultipartFile } from '@adonisjs/core/bodyparser'
import { cuid } from '@adonisjs/core/helpers'
import { Disk } from '@adonisjs/drive'
import drive from '@adonisjs/drive/services/main'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import crypto from 'node:crypto'
import { readFile, unlink } from 'node:fs/promises'

import BaseRepository from './_base_repository.js'

export default class MediaRepository extends BaseRepository<typeof Media> {
  private disk: Disk
  private S3_ViSIBILITY: string = env.get('S3_VISIBILITY')
  constructor() {
    super(Media)
    this.disk = drive.use('s3')
  }

  getKeyPrefix(key: string) {
    return key.split('/')[0]
  }

  async replace(
    file: MultipartFile,
    { media, keyPrefix, onDupe }: { media?: Media; keyPrefix: string; onDupe?: 'add' | 'use_old' },
    trx?: TransactionClientContract
  ) {
    if (media) await this.delete(media)
    return this.upload(file, { keyPrefix, onDupe }, trx)
  }

  async replaceById(
    file: MultipartFile,
    {
      id,
      keyPrefix,
      onDupe,
    }: { id?: string | null; keyPrefix: string; onDupe?: 'add' | 'use_old' },
    trx?: TransactionClientContract
  ) {
    if (id) await this.deleteById(id)
    return this.upload(file, { keyPrefix, onDupe }, trx)
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
    { keyPrefix, onDupe }: { keyPrefix: string; onDupe?: 'add' | 'use_old' },
    trx?: TransactionClientContract
  ): Promise<Media> {
    if (!file.tmpPath) throw new Error('File upload failed, temporary path not available.')

    const buffer = await readFile(file.tmpPath)
    const hash = crypto.createHash('sha256').update(buffer).digest('hex')

    if (onDupe === 'use_old') {
      const existingMedia = await this.findBy('hash', hash)

      // we only want to use found old media, if the keyPrefix / identifier is the same
      if (existingMedia && this.getKeyPrefix(existingMedia.drive_key) === keyPrefix) {
        if (file.tmpPath) await unlink(file.tmpPath)
        return existingMedia
      }
    }

    const now = new Date().getTime()
    const key = keyPrefix + '/' + `${now}-${cuid()}.${file.extname}`
    await file.moveToDisk(key, {
      name: file.clientName,
    })

    const media = await this.createGeneric(
      {
        drive_key: key,
        name: file.clientName,
        extension: file.extname,
        mime_type: `${file.type}/${file.subtype}`,
        size: file.size,
        hash,
      },
      trx
    )
    return media as Media
  }

  async delete(media: Media) {
    await this.deleteGeneric(String(media.id))

    return true
  }

  async deleteById(id: string) {
    const media = await this.findById(id)
    if (!media) return false

    await this.disk.delete(media.drive_key)
    await this.deleteGeneric(id)

    return true
  }

  // ---------------------------
  // It is very recommended to have your drive set to private!!
  // This is to prevent data from being accessed withoout credentials and crawlers
  // Also, notes: Im not sure if this works for local file system.
  // ---------------------------
  /**
   * Here, We check automatically from env to make it easier.
   * Check the code below for the methods itself
   */
  async getMediaURL(media: Media) {
    if (this.S3_ViSIBILITY === 'private') return this.getMediaURLPrivate(media)
    return this.getMediaURLPublic(media)
  }

  async getMediaURLById(id: string) {
    if (this.S3_ViSIBILITY === 'private') return this.getMediaURLPrivateById(id)
    return this.getMediaURLPublicById(id)
  }

  async getMediaURLByKey(key: string) {
    if (this.S3_ViSIBILITY === 'private') return this.getMediaURLPrivateByKey(key)
    return this.getMediaURLPublicByKey(key)
  }

  /**
   * This for public drive!
   * Not recommended at all
   */
  async getMediaURLPublic(media: Media) {
    return this.disk.getUrl(media.drive_key)
  }

  async getMediaURLPublicById(id: string) {
    const media = await this.findById(id)
    if (!media) return null

    return this.disk.getUrl(media.drive_key)
  }

  async getMediaURLPublicByKey(key: string) {
    return this.disk.getUrl(key)
  }

  /**
   * This is for private drive!
   * We use signed url for temporary access
   */
  async getMediaURLPrivate(media: Media) {
    return this.disk.getSignedUrl(media.drive_key)
  }

  async getMediaURLPrivateById(id: string) {
    const media = await this.findById(id)
    if (!media) return null

    return this.disk.getSignedUrl(media.drive_key)
  }

  async getMediaURLPrivateByKey(key: string) {
    return this.disk.getSignedUrl(key)
  }

  /**
   * This one is for getting the media stream, you can use it if you want
   * to maybe proxy the media in this case
   */
  async getMediaStream(media: Media) {
    return this.disk.getStream(media.drive_key)
  }

  async getMediaStreamById(id: string) {
    const media = await this.findById(id)
    if (!media) return null

    return this.disk.getStream(media.drive_key)
  }

  async getMediaStreamByKey(key: string) {
    return this.disk.getStream(key)
  }
}
