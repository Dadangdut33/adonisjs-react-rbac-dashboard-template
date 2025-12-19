import { QueryBuilderParams } from '#types/app'

import {
  LucidModel,
  ModelAdapterOptions,
  ModelAttributes,
  ModelQueryBuilderContract,
} from '@adonisjs/lucid/types/model'
import { ExtractModelRelations } from '@adonisjs/lucid/types/relations'

export default abstract class BaseRepository<T extends LucidModel> {
  public model: T

  constructor(model: T) {
    this.model = model
  }

  private preloadQuery(
    query: ModelQueryBuilderContract<T>,
    preload: ExtractModelRelations<InstanceType<T>>[]
  ) {
    preload.forEach((relation) => query.preload(relation))
  }

  public query(params: QueryBuilderParams<T>) {
    const {
      search = '',
      sortBy,
      sortDirection,
      preload = [],
      filters = {},
      searchRelations = [],
    } = params

    const query = this.model.query()

    if (preload.length > 0) this.preloadQuery(query, preload)

    if (Object.keys(filters).length > 0) query.where(filters)

    if (search) {
      const searchableColumns = Array.from((this.model as any).$columns.values())
        .filter(
          (col: any) =>
            !col.isPrimary &&
            col.columnName &&
            !col.columnName.endsWith('_at') &&
            col.columnName !== 'password'
        )
        .map((col: any) => col.columnName)

      query.where((builder) => {
        for (const column of searchableColumns) {
          builder.orWhere(column, 'ILIKE', `%${search}%`)
        }

        for (const { relation, columns } of searchRelations) {
          builder.orWhereHas(relation, (relationQuery) => {
            relationQuery.where((subBuilder: any) => {
              for (const column of columns) {
                subBuilder.orWhere(column, 'ILIKE', `%${search}%`)
              }
            })
          })
        }
      })
    }

    if (sortBy) {
      query.orderBy(sortBy, sortDirection || 'asc')
    } else {
      query.orderBy('updated_at', 'desc')
    }

    return query
  }

  public paginate(query: ModelQueryBuilderContract<T>, params: QueryBuilderParams<T>) {
    const { page = 1, perPage = 10 } = params

    return query.paginate(page, perPage)
  }

  public async findBy(column: string, value: string | number) {
    return this.model.query().where(column, value).first()
  }

  public async findById(id: any) {
    return this.model.find(id)
  }

  public async findOrFail(value: any, options?: ModelAdapterOptions) {
    return this.model.findOrFail(value, options)
  }

  public async findByOrFail(column: string, value: string | number, options?: ModelAdapterOptions) {
    return this.model.findByOrFail(column, value, options)
  }

  public async updateGeneric<P extends Partial<ModelAttributes<InstanceType<T>>>>(
    instance: InstanceType<T>,
    data: P
  ) {
    instance.merge(data)
    return instance.save()
  }

  public async createGeneric<P extends Partial<ModelAttributes<InstanceType<T>>>>(data: P) {
    const instance = new this.model()
    instance.fill(data)
    return instance.save()
  }

  public async deleteGeneric(id: any) {
    const instance = await this.findById(id)
    if (!instance) throw new Error(`${this.model.name} not found`)
    await instance.delete()
  }

  public async updateOrCreateGeneric<P extends Partial<ModelAttributes<InstanceType<T>>>>(data: P) {
    const { id, ...rest } = data as { id?: string | number }
    const filter = id ? ({ id } as unknown as Partial<ModelAttributes<InstanceType<T>>>) : {}
    const instance = await this.model.updateOrCreate(filter, rest as P)
    return instance
  }
}
