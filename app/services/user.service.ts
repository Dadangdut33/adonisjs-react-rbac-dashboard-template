import Media from '#models/media'
import User from '#models/user'
import MediaRepository from '#repositories/media.repository'
import ProfileRepository from '#repositories/profile.repository'
import UserRepository from '#repositories/user.repository'
import { QueryBuilderParams } from '#types/app'
import { UserPayload } from '#types/inferred'

import { inject } from '@adonisjs/core'
import db from '@adonisjs/lucid/services/db'
import { randomUUID } from 'node:crypto'

@inject()
export default class UserService {
  constructor(
    protected repo: UserRepository,
    protected mediaRepo: MediaRepository,
    protected profileRepo: ProfileRepository
  ) {}

  async index(queryParams: QueryBuilderParams<typeof User>) {
    const q = this.repo.query({
      ...queryParams,
      preload: ['roles', 'profile'],
      exclude: ['password'],
      excludePreload: ['profile.bio'],
      searchRelations: [{ relation: 'roles', columns: ['name'] }],
      sortableRelations: [{ relation: 'roles', column: 'name', aggregate: 'min' }],
    })

    return await this.repo.paginate(q, queryParams)
  }

  async findById(id: string) {
    return await this.repo.findById(id)
  }

  async findByIds(ids: any[]) {
    return this.repo.model.query().whereIn('id', ids).preload('profile')
  }

  async findOrFail(id: string) {
    return await this.repo.findOrFail(id)
  }

  async create(payload: UserPayload) {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { avatar, avatar_clear, roleIds, ...rest } = payload

    // create user roles and profile in transaction
    const trx = await db.transaction()
    let user
    try {
      const id = randomUUID()
      user = new User()
      user.useTransaction(trx)
      user.fill({ ...rest, id })
      await user.save()

      let media: Media | null = null
      // first upload avatar if exist
      if (avatar) media = await this.mediaRepo.upload(avatar, { keyPrefix: id }, trx)

      // create roles and profile
      await user.related('roles').attach(roleIds)
      await user.related('profile').create({
        user_id: id,
        avatar_id: media?.id,
      })

      await trx.commit()
    } catch (error) {
      await trx.rollback()
      throw error
    }

    return user
  }

  async update(payload: UserPayload) {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { avatar, avatar_clear, roleIds, ...rest } = payload
    const trx = await db.transaction()
    let user
    try {
      user = await this.repo.findOrFail(payload.id)
      user.useTransaction(trx)
      user.merge(rest)
      await user.load('profile')
      await user.save()

      let media: Media | null = null
      if (avatar) {
        media = await this.mediaRepo.replaceById(
          avatar,
          { keyPrefix: user.id, id: user.profile.avatar_id! },
          trx
        )
      } else if (avatar_clear) {
        await this.mediaRepo.deleteGeneric(user.profile.avatar_id!, trx)
      }

      await user.related('roles').detach()
      await user.related('roles').attach(roleIds)
      await user.related('profile').updateOrCreate(
        {
          user_id: user.id,
        },
        {
          avatar_id: media?.id,
        }
      )

      await trx.commit()
    } catch (error) {
      await trx.rollback()
      throw error
    }

    return user
  }

  async deleteUser(id: string) {
    return this.repo.deleteGeneric(id)
  }

  async deleteUsers(ids: string[]) {
    return this.repo.deleteBulk(ids)
  }
}
