import Media from '#models/media'
import MediaRepository from '#repositories/media.repository'

import { inject } from '@adonisjs/core'
import { MultipartFile } from '@adonisjs/core/bodyparser'
import { cuid } from '@adonisjs/core/helpers'
import app from '@adonisjs/core/services/app'
import { Disk } from '@adonisjs/drive'
import drive from '@adonisjs/drive/services/main'
import crypto from 'node:crypto'
import { readFile, unlink } from 'node:fs/promises'

@inject()
export default class MediaService {
  private disk: Disk
  constructor(protected repo: MediaRepository) {
    this.disk = drive.use()
  }

  async upload(file: MultipartFile): Promise<Media> {
    if (!file.tmpPath) {
      throw new Error('File upload failed, temporary path not available.')
    }
    const buffer = await readFile(file.tmpPath)
    const hash = crypto.createHash('sha256').update(buffer).digest('hex')

    const existingMedia = await this.repo.findBy('hash', hash)
    if (existingMedia) {
      // If media exists, we don't need the new upload, so delete it.
      if (file.tmpPath) await unlink(file.tmpPath)

      return existingMedia
    }

    const driveKey = `${cuid()}.${file.extname}`
    await file.moveToDisk(app.makePath('uploads'), {
      name: driveKey,
    })

    const media = await this.repo.createGeneric({
      drive_key: driveKey,
      name: file.clientName,
      extension: file.extname,
      mime_type: `${file.type}/${file.subtype}`,
      size: file.size,
      hash,
    })
    return media as Media
  }

  async delete(media: Media): Promise<void> {
    await this.disk.delete(media.drive_key)
    await this.repo.deleteGeneric(String(media.id))
  }
}
