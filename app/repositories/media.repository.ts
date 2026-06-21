import Media from '#models/media'
import Tag from '#models/tag'
import TagRepository from '#repositories/tag.repository'
import env from '#start/env'

import type { MultipartFile } from '@adonisjs/core/bodyparser'
import type { Disk } from '@adonisjs/drive'
import drive from '@adonisjs/drive/services/main'
import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import crypto from 'node:crypto'
import { readFile, unlink } from 'node:fs/promises'

import BaseRepository from './_base_repository.js'

export default class MediaRepository extends BaseRepository<typeof Media> {
  private disk: Disk
  private S3_ViSIBILITY: string = env.get('S3_VISIBILITY')
  private MEDIA_TAG_TYPE: 'media' = 'media'
  private tagRepo: TagRepository

  constructor() {
    super(Media)
    this.disk = drive.use('s3')
    this.tagRepo = new TagRepository()
  }

  getKeyPrefix(key: string) {
    const normalizedKey = key.trim().replace(/^\/+|\/+$/g, '')
    if (!normalizedKey) return ''

    const lastSlashIndex = normalizedKey.lastIndexOf('/')
    if (lastSlashIndex === -1) return ''

    return normalizedKey.slice(0, lastSlashIndex)
  }

  async replace(
    file: MultipartFile,
    {
      media,
      keyPrefix,
      onDupe,
      tags,
    }: { media?: Media; keyPrefix: string; onDupe?: 'add' | 'use_old'; tags?: string[] },
    trx?: TransactionClientContract
  ) {
    if (media) await this.delete(media)
    return this.upload(file, { keyPrefix, onDupe, tags }, trx)
  }

  async replaceById(
    file: MultipartFile,
    {
      id,
      keyPrefix,
      onDupe,
      tags,
    }: { id?: string | null; keyPrefix: string; onDupe?: 'add' | 'use_old'; tags?: string[] },
    trx?: TransactionClientContract
  ) {
    if (id) await this.deleteById(id)
    return this.upload(file, { keyPrefix, onDupe, tags }, trx)
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
    { keyPrefix, onDupe, tags }: { keyPrefix: string; onDupe?: 'add' | 'use_old'; tags?: string[] },
    trx?: TransactionClientContract
  ): Promise<Media> {
    if (!file.tmpPath) throw new Error('File upload failed, temporary path not available.')

    const buffer = await readFile(file.tmpPath)
    const hash = crypto.createHash('sha256').update(buffer).digest('hex')

    if (onDupe === 'use_old') {
      const existingMedia = await this.findBy('hash', hash)

      // we only want to use found old media, if the keyPrefix / identifier is the same
      // if its different, we cannot reuse it since it might link to cases such as other user's media
      if (existingMedia && this.getKeyPrefix(existingMedia.drive_key) === keyPrefix) {
        if (file.tmpPath) await unlink(file.tmpPath)
        return existingMedia
      }
    }

    const now = new Date().getTime()
    const key = keyPrefix + '/' + `${now}-${crypto.randomUUID()}.${file.extname}`
    await file.moveToDisk(key, {
      name: file.clientName,
      CacheControl: 'public, max-age=31536000, immutable',
    })

    const media = (await this.createGeneric(
      // tags is a relation so we dont put it here
      {
        drive_key: key,
        name: file.clientName,
        extension: file.extname,
        mime_type: `${file.type}/${file.subtype}`,
        size: file.size,
        hash,
      },
      trx
    )) as Media

    const normalizedTags = this.normalizeTags(tags)
    if (normalizedTags !== undefined) {
      // sync tags if tags is provided (even if its empty, we want to sync to remove old tags)
      await this.syncMediaTags(media, normalizedTags, trx)
      await media.load('tags')
    }

    return media as Media
  }

  async uploadBuffer(
    buffer: Uint8Array,
    {
      keyPrefix,
      name,
      extension,
      mimeType,
      onDupe,
      tags,
    }: {
      keyPrefix: string
      name: string
      extension: string
      mimeType: string
      onDupe?: 'add' | 'use_old'
      tags?: string[]
    },
    trx?: TransactionClientContract
  ): Promise<Media> {
    const hash = crypto.createHash('sha256').update(buffer).digest('hex')

    if (onDupe === 'use_old') {
      const existingMedia = await this.findBy('hash', hash)

      if (existingMedia && this.getKeyPrefix(existingMedia.drive_key) === keyPrefix) {
        return existingMedia
      }
    }

    const safeExtension = extension.replace(/^\.+/, '').toLowerCase() || 'bin'
    const now = new Date().getTime()
    const key = keyPrefix + '/' + `${now}-${crypto.randomUUID()}.${safeExtension}`

    await this.disk.put(key, buffer, {
      contentType: mimeType,
      contentLength: buffer.byteLength,
      cacheControl: 'public, max-age=31536000, immutable',
    })

    const media = (await this.createGeneric(
      {
        drive_key: key,
        name,
        extension: safeExtension,
        mime_type: mimeType,
        size: buffer.byteLength,
        hash,
      },
      trx
    )) as Media

    const normalizedTags = this.normalizeTags(tags)
    if (normalizedTags !== undefined) {
      await this.syncMediaTags(media, normalizedTags, trx)
      await media.load('tags')
    }

    return media as Media
  }

  private normalizeTags(tags: string[] | null | undefined) {
    if (tags === undefined) return undefined
    if (tags === null) return []

    return tags
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
      .filter((value, index, self) => self.indexOf(value) === index)
  }

  private async ensureTagIds(
    tagNames: string[],
    trx?: TransactionClientContract
  ): Promise<string[]> {
    if (tagNames.length === 0) return []

    const existingTags = await Tag.query({ client: trx })
      .where('type', this.MEDIA_TAG_TYPE)
      .whereIn('name', tagNames)
    const tagIdByName = new Map(existingTags.map((tag) => [tag.name, tag.id]))

    for (const tagName of tagNames) {
      if (tagIdByName.has(tagName)) continue

      const tag = await Tag.create({ name: tagName, type: this.MEDIA_TAG_TYPE }, { client: trx })
      tagIdByName.set(tagName, tag.id)
    }

    return tagNames.map((tagName) => tagIdByName.get(tagName)!).filter(Boolean)
  }

  private async syncMediaTags(media: Media, tagNames: string[], trx?: TransactionClientContract) {
    const tagIds = await this.ensureTagIds(tagNames, trx)

    if (trx) media.useTransaction(trx)
    await media.related('tags').sync(tagIds)
  }

  async delete(media: Media) {
    await this.deleteGeneric(String(media.id))

    return true
  }

  async deleteById(id: string) {
    const trx = await db.transaction()

    const media = await this.findById(id)
    if (!media) {
      await trx.rollback()
      return false
    }

    media.useTransaction(trx)
    await this.disk.delete(media.drive_key)
    await media.delete()
    await this.tagRepo.cleanupUnusedTags(this.MEDIA_TAG_TYPE, trx)
    await trx.commit()

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
    return this.disk.getSignedUrl(media.drive_key, { expiresIn: '1h' })
  }

  async getMediaURLPrivateById(id: string) {
    const media = await this.findById(id)
    if (!media) return null

    return this.disk.getSignedUrl(media.drive_key, { expiresIn: '1h' })
  }

  async getMediaURLPrivateByKey(key: string) {
    return this.disk.getSignedUrl(key, { expiresIn: '1h' })
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

  applyTagAccessFilter(baseQuery: any, allowedTagIds: string[]) {
    if (allowedTagIds.length === 0) {
      return baseQuery.whereRaw('1 = 0')
    }

    return baseQuery.whereHas('tags', (query: any) => {
      query.whereIn('tags.id', allowedTagIds)
    })
  }

  applyMediaTypeFilter(baseQuery: any, filter: 'all' | 'images' | 'files' | 'videos' | 'audio') {
    if (!filter || filter === 'all') return baseQuery

    if (filter === 'images') {
      return baseQuery.whereRaw(`LOWER(??) LIKE ?`, ['mime_type', 'image/%'])
    }

    if (filter === 'videos') {
      return baseQuery.whereRaw(`LOWER(??) LIKE ?`, ['mime_type', 'video/%'])
    }

    if (filter === 'audio') {
      return baseQuery.whereRaw(`LOWER(??) LIKE ?`, ['mime_type', 'audio/%'])
    }

    // files = non-image and also non-video/audio (reserved for dedicated filters)
    return baseQuery
      .whereRaw(`LOWER(??) NOT LIKE ?`, ['mime_type', 'image/%'])
      .whereRaw(`LOWER(??) NOT LIKE ?`, ['mime_type', 'video/%'])
      .whereRaw(`LOWER(??) NOT LIKE ?`, ['mime_type', 'audio/%'])
  }

  async canAccessMediaByTagIds(mediaId: string, allowedTagIds: string[]) {
    if (allowedTagIds.length === 0) return false

    const media = await this.model
      .query()
      .where('id', mediaId)
      .whereHas('tags', (query: any) => {
        query.whereIn('tags.id', allowedTagIds)
      })
      .first()

    return !!media
  }
}
