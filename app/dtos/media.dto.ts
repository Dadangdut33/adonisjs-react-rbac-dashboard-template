import Media from '#models/media'

export class MediaDto {
  readonly id: string
  readonly drive_key: string
  readonly mime_type: string
  readonly name: string
  readonly extension: string
  readonly size: number
  readonly hash: string
  readonly created_at: string // dto needs to be string
  readonly updated_at: string
  url?: string

  constructor(media: Media) {
    this.id = media.id
    this.drive_key = media.drive_key
    this.mime_type = media.mime_type
    this.name = media.name
    this.extension = media.extension
    this.size = media.size
    this.hash = media.hash
    this.created_at = media.created_at.toString()
    this.updated_at = media.updated_at ? media.updated_at.toString() : ''
    this.loadUrl(media.url)
  }

  private async loadUrl(url: Promise<string>) {
    this.url = await url
  }

  // Collect is for multiple dtos
  static collect(medias: Media[]): MediaDto[] {
    return medias.map((media) => new MediaDto(media))
  }
}
