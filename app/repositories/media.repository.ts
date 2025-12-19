import Media from '#models/media'

import BaseRepository from './_base_repository.js'

export default class MediaRepository extends BaseRepository<typeof Media> {
  constructor() {
    super(Media)
  }
}
