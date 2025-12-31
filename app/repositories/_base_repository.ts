import { parseRelationColumn } from '#lib/utils'
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
      searchBy = {},
      sortBy,
      sortDirection,
      preload = [],
      filters = {},
      searchRelations = [],
      searchableCol,
      sortableCol,
    } = params
    // Create the base query
    const query = this.model.query()

    // Preload relations
    if (preload.length > 0) this.preloadQuery(query, preload)

    // Apply filters
    if (Object.keys(filters).length > 0) query.where(filters)

    /**
     * Global search
     */
    if (search) {
      //  Get all column definitions
      const allColumns = Array.from(this.model.$columnsDefinitions.values())

      // Filter columns based on 'searchableCol' whitelist if it exists
      let targetColumns = allColumns
      if (searchableCol && searchableCol.length > 0) {
        targetColumns = allColumns.filter((col) => searchableCol.includes(col.columnName))
      }

      query.where((builder) => {
        for (const col of targetColumns) {
          // Check metadata type
          const isString = col.meta?.type === 'string'

          if (isString) {
            builder.orWhere(col.columnName, 'ILIKE', `%${search}%`)
          } else {
            builder.orWhereRaw(`??::text ILIKE ?`, [col.columnName, `%${search}%`])
          }
        }

        // Relation global search
        for (const { relation, columns } of searchRelations) {
          builder.orWhereHas(relation as any, (relationQuery) => {
            relationQuery.where((subBuilder: any) => {
              for (const column of columns) {
                // We use orWhereRaw here because we don't easily have the
                // metadata for related models in this loop
                subBuilder.orWhereRaw(`??::text ILIKE ?`, [column, `%${search}%`])
              }
            })
          })
        }
      })
    }

    /**
     * Column-based search
     */
    if (Object.keys(searchBy).length > 0) {
      // We use .where() here to wrap all column filters in a single AND (...) group
      query.where((builder) => {
        for (const [column, value] of Object.entries(searchBy)) {
          if (value === undefined || value === null || value === '') continue

          // first check if the column is in these format:
          // - column
          // - relation.column
          const { relation, column: colRelation } = parseRelationColumn(column) || {}

          if (relation && colRelation) {
            // make sure its searchable if searchableCol is defined
            if (searchableCol?.length && !searchableCol.includes(colRelation)) continue

            // .whereHas is 'AND' logic
            builder.whereHas(
              relation as ExtractModelRelations<InstanceType<T>>,
              (relationQuery) => {
                relationQuery.whereRaw(`??::text ILIKE ?`, [colRelation, `%${value}%`])
              }
            )
          } else {
            // make sure its searchable if searchableCol is defined
            if (searchableCol?.length && !searchableCol.includes(column)) continue

            const colDef = this.model.$columnsDefinitions.get(column)

            // Handle Booleans specifically
            if (colDef?.meta?.type === 'boolean' || value === 'true' || value === 'false') {
              const boolValue = String(value).toLowerCase() === 'true'
              builder.where(column, boolValue)
            } else if (colDef?.meta?.type === 'string') {
              // Handle Strings
              builder.where(column, 'ILIKE', `%${value}%`)
            } else {
              // Fallback for other types (number, date, etc)
              builder.whereRaw(`??::text ILIKE ?`, [column, `%${value}%`])
            }
          }
        }
      })
    }

    /**
     * Sorting
     */
    if (sortBy) {
      // first check if sortable columns are defined | if not whitelisted, skip / prevent from being sortable
      if (sortableCol && sortableCol.length > 0 && !sortableCol.includes(sortBy))
        return query.orderBy('updated_at', 'desc')

      query.orderBy(sortBy, sortDirection || 'asc')
    } else {
      query.orderBy('updated_at', 'desc')
    }

    return query
  }

  public paginate(query: ModelQueryBuilderContract<T>, params: QueryBuilderParams<T>) {
    const { page = 1, perPage = 15 } = params

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
