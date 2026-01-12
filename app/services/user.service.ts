import User from '#models/user'
import UserRepository from '#repositories/user.repository'
import { QueryBuilderParams } from '#types/app'
import { UserPayload } from '#types/inferred'

import { inject } from '@adonisjs/core'

@inject()
export default class UserService {
  constructor(protected repo: UserRepository) {}

  async index(queryParams: QueryBuilderParams<typeof User>) {
    const q = this.repo.query({
      ...queryParams,
      preload: ['roles', 'profile'],
      searchRelations: [{ relation: 'roles', columns: ['name'] }],
      sortableRelations: [{ relation: 'roles', column: 'name', aggregate: 'min' }],
    })

    return await this.repo.paginate(q, queryParams)
  }

  async findById(id: string) {
    return await this.repo.findById(id)
  }

  async findOrFail(id: string) {
    return await this.repo.findOrFail(id)
  }

  async createUpdate(data: UserPayload) {
    return this.repo.updateOrCreateUser(data)
  }

  async deleteUser(id: string) {
    return this.repo.deleteGeneric(id)
  }
}
