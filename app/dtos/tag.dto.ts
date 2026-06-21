import Tag from '#models/tag'

export class TagDto {
  readonly id: string
  readonly name: string
  readonly type: 'blog' | 'media'
  readonly created_at: string
  readonly updated_at: string

  constructor(tag: Tag) {
    this.id = tag.id
    this.name = tag.name
    this.type = tag.type
    this.created_at = tag.created_at ? tag.created_at.toString() : ''
    this.updated_at = tag.updated_at ? tag.updated_at.toString() : ''
  }

  static collect(tags: Tag[]): TagDto[] {
    return tags.map((tag) => new TagDto(tag))
  }
}
