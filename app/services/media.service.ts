import Media from '#models/media'
import User from '#models/user'
import MediaRepository from '#repositories/media.repository'
import { QueryBuilderParams } from '#types/app'

import { inject } from '@adonisjs/core'
import { MultipartFile } from '@adonisjs/core/bodyparser'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import axios from 'axios'
import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'

@inject()
export default class MediaService {
  constructor(protected repo: MediaRepository) {}

  private readonly remoteImportMaxBytes = 50 * 1024 * 1024
  private readonly privateIpv4Prefixes = [
    '10.',
    '127.',
    '169.254.',
    '172.16.',
    '172.17.',
    '172.18.',
    '172.19.',
    '172.20.',
    '172.21.',
    '172.22.',
    '172.23.',
    '172.24.',
    '172.25.',
    '172.26.',
    '172.27.',
    '172.28.',
    '172.29.',
    '172.30.',
    '172.31.',
    '192.168.',
  ]
  private readonly extensionByMime: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'video/mp4': 'mp4',
    'video/quicktime': 'mov',
    'video/x-msvideo': 'avi',
    'video/x-matroska': 'mkv',
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
    'audio/x-wav': 'wav',
    'audio/mp4': 'm4a',
    'audio/flac': 'flac',
    'audio/ogg': 'ogg',
    'application/pdf': 'pdf',
    'text/plain': 'txt',
    'text/csv': 'csv',
    'application/zip': 'zip',
    'application/x-zip-compressed': 'zip',
    'application/vnd.rar': 'rar',
    'application/x-7z-compressed': '7z',
  }
  private readonly acceptedRemoteExtensions = new Set([
    'jpg',
    'jpeg',
    'png',
    'webp',
    'gif',
    'mp4',
    'mov',
    'avi',
    'mkv',
    'webm',
    'mp3',
    'wav',
    'm4a',
    'flac',
    'ogg',
    'aac',
    'opus',
    'pdf',
    'doc',
    'docx',
    'xls',
    'xlsx',
    'ppt',
    'pptx',
    'odt',
    'ods',
    'odp',
    'rtf',
    'csv',
    'txt',
    'zip',
    'rar',
    '7z',
    'tar',
    'gz',
    'bz2',
    'xz',
  ])

  private async getAllowedTagIdsForUser(user: User) {
    await user.load('roles', (query) => {
      query.preload('media_tags')
    })

    if (user.roles.some((role) => role.can_access_all_media_tags)) {
      return null
    }

    const tagIds = new Set<string>()
    for (const role of user.roles) {
      for (const tag of role.media_tags || []) {
        tagIds.add(tag.id)
      }
    }

    return [...tagIds]
  }

  async makeQuery(queryParams: QueryBuilderParams<typeof Media>) {
    const preload = queryParams.preload ? [...queryParams.preload] : []
    if (!preload.includes('tags')) preload.push('tags')

    const q = this.repo.query({
      ...queryParams,
      preload,
    })

    this.repo.applyMediaTypeFilter(
      q as any,
      (queryParams.filter || 'all') as 'all' | 'images' | 'files' | 'videos' | 'audio'
    )

    return { q, params: queryParams }
  }

  async index(queryParams: QueryBuilderParams<typeof Media>) {
    const { q, params } = await this.makeQuery(queryParams)
    return this.repo.paginate(q, params)
  }

  async indexByUser(user: User, queryParams: QueryBuilderParams<typeof Media>) {
    const { q, params } = await this.makeQuery(queryParams)

    const allowedTagIds = await this.getAllowedTagIdsForUser(user)
    if (allowedTagIds !== null) {
      this.repo.applyTagAccessFilter(q, allowedTagIds)
    }

    return await this.repo.paginate(q, params)
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

  private normalizeRemoteUrl(rawUrl: string) {
    const trimmed = rawUrl.trim()
    if (!trimmed) throw new Error('URL is required')
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  }

  private isPrivateOrLocalAddress(address: string) {
    const normalized = address.toLowerCase()
    const ipVersion = isIP(normalized)
    if (!ipVersion) return false

    if (ipVersion === 4) {
      return this.privateIpv4Prefixes.some((prefix) => normalized.startsWith(prefix))
    }

    return (
      normalized === '::1' ||
      normalized.startsWith('fe80:') ||
      normalized.startsWith('fc') ||
      normalized.startsWith('fd')
    )
  }

  private async assertSafeRemoteUrl(url: URL) {
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error('Only http/https URLs are allowed')
    }

    const hostname = url.hostname.toLowerCase()
    if (hostname === 'localhost' || hostname === '0.0.0.0' || hostname === '::1') {
      throw new Error('Local/private URLs are not allowed')
    }

    if (this.isPrivateOrLocalAddress(hostname)) {
      throw new Error('Local/private URLs are not allowed')
    }

    const addresses = await lookup(hostname, { all: true })
    if (addresses.some((record) => this.isPrivateOrLocalAddress(record.address))) {
      throw new Error('Local/private URLs are not allowed')
    }
  }

  private getFileNameFromResponse(url: URL, contentDisposition?: string) {
    const dispositionName =
      contentDisposition?.match(/filename\*=UTF-8''([^;]+)/i)?.[1] ||
      contentDisposition?.match(/filename="?([^";]+)"?/i)?.[1]

    if (dispositionName) {
      try {
        return decodeURIComponent(dispositionName)
      } catch {
        return dispositionName
      }
    }

    const urlName = url.pathname.split('/').filter(Boolean).pop()
    if (urlName) {
      try {
        return decodeURIComponent(urlName)
      } catch {
        return urlName
      }
    }

    return 'remote-media'
  }

  private getExtension(name: string, mimeType: string) {
    const extension = name.split('.').pop()?.toLowerCase() || ''
    if (this.acceptedRemoteExtensions.has(extension)) return extension
    return this.extensionByMime[mimeType] || ''
  }

  private async downloadRemoteMedia(rawUrl: string) {
    let currentUrl = new URL(this.normalizeRemoteUrl(rawUrl))

    for (let redirectCount = 0; redirectCount <= 5; redirectCount++) {
      await this.assertSafeRemoteUrl(currentUrl)

      const response = await axios.get<ArrayBuffer>(currentUrl.toString(), {
        responseType: 'arraybuffer',
        timeout: 15000,
        maxRedirects: 0,
        validateStatus: (status) => status >= 200 && status < 400,
        headers: {
          'User-Agent': 'Mozilla/5.0',
          Accept: 'image/*,video/*,audio/*,application/pdf,text/plain,text/csv,*/*;q=0.8',
        },
      })

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.location
        if (!location || typeof location !== 'string') {
          throw new Error('Remote URL redirected without a location header')
        }

        currentUrl = new URL(location, currentUrl)
        continue
      }

      const contentLength = Number(response.headers['content-length'] || 0)
      if (contentLength > this.remoteImportMaxBytes) {
        throw new Error('Remote media must be less than 50MB')
      }

      const buffer = Buffer.from(response.data)
      if (buffer.byteLength > this.remoteImportMaxBytes) {
        throw new Error('Remote media must be less than 50MB')
      }

      const mimeType = String(response.headers['content-type'] || 'application/octet-stream')
        .split(';')[0]
        .trim()
        .toLowerCase()
      const name = this.getFileNameFromResponse(
        currentUrl,
        typeof response.headers['content-disposition'] === 'string'
          ? response.headers['content-disposition']
          : undefined
      )
      const extension = this.getExtension(name, mimeType)
      if (!extension || !this.acceptedRemoteExtensions.has(extension)) {
        throw new Error('Unsupported remote media type')
      }

      return {
        buffer,
        name: name.includes('.') ? name : `${name}.${extension}`,
        extension,
        mimeType,
      }
    }

    throw new Error('Remote URL redirected too many times')
  }

  async importFromUrl(
    url: string,
    {
      keyPrefix,
      onDupe = 'add',
      tags,
    }: { keyPrefix: string; onDupe?: 'add' | 'use_old'; tags?: string[] },
    trx?: TransactionClientContract
  ): Promise<Media> {
    const remoteMedia = await this.downloadRemoteMedia(url)
    return this.repo.uploadBuffer(
      remoteMedia.buffer,
      {
        keyPrefix,
        name: remoteMedia.name,
        extension: remoteMedia.extension,
        mimeType: remoteMedia.mimeType,
        onDupe,
        tags,
      },
      trx
    )
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

  async canUserAccessMedia(user: User, mediaId: string) {
    const allowedTagIds = await this.getAllowedTagIdsForUser(user)
    if (allowedTagIds === null) return true
    return this.repo.canAccessMediaByTagIds(mediaId, allowedTagIds)
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
