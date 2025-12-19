import User from '#models/user'

import BaseRepository from './_base_repository.js'

export default class AuthRepository extends BaseRepository<typeof User> {
  constructor() {
    super(User)
  }
}
