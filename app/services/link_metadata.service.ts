import axios from 'axios'
import { isIP } from 'node:net'

type LinkMetadataResult = {
  url: string
  title: string | null
  description: string | null
  imageUrl: string | null
  siteName: string | null
}

const PRIVATE_IPV4_PREFIXES = [
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

export default class LinkMetadataService {
  private normalizeUrl(rawUrl: string) {
    const trimmed = rawUrl.trim()
    if (!trimmed) return ''
    if (/^https?:\/\//i.test(trimmed)) return trimmed
    return `https://${trimmed}`
  }

  private isPrivateOrLocalHost(hostname: string) {
    const host = hostname.toLowerCase()
    if (host === 'localhost' || host === '0.0.0.0' || host === '::1') return true

    const ipVersion = isIP(host)
    if (!ipVersion) return false

    if (ipVersion === 4) {
      return PRIVATE_IPV4_PREFIXES.some((prefix) => host.startsWith(prefix))
    }

    // IPv6 local/private ranges (loopback/link-local/ULA)
    return (
      host === '::1' || host.startsWith('fe80:') || host.startsWith('fc') || host.startsWith('fd')
    )
  }

  private extractMetaTag(html: string, key: string, attr: 'property' | 'name') {
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(
      `<meta[^>]+${attr}\\s*=\\s*["']${escaped}["'][^>]*content\\s*=\\s*["']([^"']+)["'][^>]*>`,
      'i'
    )
    return html.match(regex)?.[1]?.trim() || null
  }

  private extractTitle(html: string) {
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]
    return titleMatch?.replace(/\s+/g, ' ').trim() || null
  }

  private resolveAssetUrl(baseUrl: string, maybeUrl: string | null) {
    if (!maybeUrl) return null
    try {
      return new URL(maybeUrl, baseUrl).toString()
    } catch {
      return null
    }
  }

  async fetch(rawUrl: string): Promise<LinkMetadataResult> {
    const normalizedUrl = this.normalizeUrl(rawUrl)
    if (!normalizedUrl) throw new Error('URL is required')

    const parsedUrl = new URL(normalizedUrl)
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Only http/https URLs are allowed')
    }
    if (this.isPrivateOrLocalHost(parsedUrl.hostname)) {
      throw new Error('Local/private URLs are not allowed')
    }

    const { data } = await axios.get<string>(normalizedUrl, {
      timeout: 8000,
      maxRedirects: 5,
      responseType: 'text',
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
      validateStatus: (status) => status >= 200 && status < 400,
    })

    const html = typeof data === 'string' ? data : ''
    const title =
      this.extractMetaTag(html, 'og:title', 'property') ||
      this.extractMetaTag(html, 'twitter:title', 'name') ||
      this.extractTitle(html)

    const description =
      this.extractMetaTag(html, 'og:description', 'property') ||
      this.extractMetaTag(html, 'description', 'name') ||
      this.extractMetaTag(html, 'twitter:description', 'name')

    const imageUrl = this.resolveAssetUrl(
      normalizedUrl,
      this.extractMetaTag(html, 'og:image', 'property') ||
        this.extractMetaTag(html, 'twitter:image', 'name')
    )

    const siteName =
      this.extractMetaTag(html, 'og:site_name', 'property') ||
      this.extractMetaTag(html, 'application-name', 'name') ||
      parsedUrl.hostname.replace(/^www\./i, '')

    return {
      url: normalizedUrl,
      title,
      description,
      imageUrl,
      siteName,
    }
  }
}
