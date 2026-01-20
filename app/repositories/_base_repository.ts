import { parseRelationColumn, parseSelectPreload } from '#lib/utils'
import { QueryBuilderParams } from '#types/app'

import { TransactionClientContract } from '@adonisjs/lucid/types/database'
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
    preload: string[],
    excludePreload: string[] = [],
    selectPreload: string[] = []
  ) {
    const relations: Record<string, string[]> = {}

    preload.forEach((item) => {
      const [relation, ...rest] = item.split('.')
      if (!relations[relation]) relations[relation] = []
      if (rest.length) relations[relation].push(rest.join('.'))
    })

    const excludeMap: Record<string, string[]> = {}
    excludePreload.forEach((item) => {
      const [relation, ...rest] = item.split('.')
      if (!excludeMap[relation]) excludeMap[relation] = []
      if (rest.length) excludeMap[relation].push(rest.join('.'))
    })

    const selectMap = parseSelectPreload(selectPreload)

    for (const relation in relations) {
      query.preload(relation as any, (subQuery) => {
        const model = subQuery.model

        const selectedCols = selectMap[relation]
        const excludedCols = excludeMap[relation] ?? []

        /**
         * Priority:
         * 1. selectPreload
         * 2. excludePreload
         * 3. defaultExclude (optional)
         */
        if (selectedCols?.length) {
          subQuery.select(selectedCols)
        } else if (excludedCols.length) {
          const allColumns = Array.from(model.$columnsDefinitions.values()).map(
            (c: any) => c.columnName
          )

          subQuery.select(allColumns.filter((c: string) => !excludedCols.includes(c)))
        }

        if (relations[relation].length > 0) {
          this.preloadQuery(
            subQuery,
            relations[relation],
            excludeMap[relation] ?? [],
            selectPreload
          )
        }
      })
    }
  }

  private applyRelationSort(
    query: ModelQueryBuilderContract<T>,
    sortBy: string,
    sortDirection: 'asc' | 'desc',
    sortableRelations: QueryBuilderParams<T>['sortableRelations']
  ) {
    const parsed = parseRelationColumn(sortBy)
    if (!parsed || !sortableRelations) return false

    const rule = sortableRelations.find(
      (r) => r.relation === parsed.relation && r.column === parsed.column
    )
    if (!rule) return false

    const aggregate = rule.aggregate ?? 'min'
    const direction = sortDirection ?? 'asc'

    /**
     * NOTE:
     * This assumes conventional pivot naming:
     * users, roles, user_roles
     */
    const modelTable = this.model.table
    const relation = this.model.$getRelation(parsed.relation as any)

    if (relation.type !== 'manyToMany') return false

    const pivotTable = relation.pivotTable
    const relatedTable = relation.relatedModel().table
    const localKey = relation.localKey
    const pivotForeignKey = relation.pivotForeignKey
    const pivotRelatedForeignKey = relation.pivotRelatedForeignKey
    const relatedKey = relation.relatedKey

    query
      .select(`${modelTable}.*`)
      .leftJoin(pivotTable, `${modelTable}.${localKey}`, `${pivotTable}.${pivotForeignKey}`)
      .leftJoin(
        relatedTable,
        `${relatedTable}.${relatedKey}`,
        `${pivotTable}.${pivotRelatedForeignKey}`
      )
      .groupBy(`${modelTable}.${localKey}`)
      .orderByRaw(
        `${aggregate.toUpperCase()}(${relatedTable}.${parsed.column}) ${direction.toUpperCase()}`
      )

    return true
  }

  public query(params: QueryBuilderParams<T>) {
    const {
      search = '',
      searchBy = {},
      sortBy,
      sortDirection,
      preload = [], // example: ['roles', 'profile.avatar']
      filters = {},
      searchRelations = [],
      searchableCol,
      sortableCol,
      selectPreload,
      excludePreload,
    } = params
    // Create the base query
    const query = this.model.query()

    /**
     * Column selection (select / exclude)
     */
    const allColumnsName = Array.from(this.model.$columnsDefinitions.values()).map(
      (c) => c.columnName
    )

    // Prefer select over exclude
    if (params.select && params.select.length > 0) {
      query.select(params.select as string[])
    } else if (params.exclude && params.exclude.length > 0) {
      const excluded = new Set(params.exclude as string[])
      const selected = allColumnsName.filter((col) => !excluded.has(col))

      query.select(selected)
    }

    // Preload relations
    if (preload.length > 0) {
      this.preloadQuery(query, preload, excludePreload, selectPreload)
    }

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
      // relation sorting
      const handled = this.applyRelationSort(
        query,
        sortBy,
        sortDirection || 'asc',
        params.sortableRelations
      )

      if (handled) return query

      // column whitelist
      if (sortableCol?.length && !sortableCol.includes(sortBy)) {
        return query.orderBy('updated_at', 'desc')
      }

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
    data: P,
    trx?: TransactionClientContract
  ) {
    if (trx) instance.useTransaction(trx)
    instance.merge(data)
    return instance.save()
  }

  public async createGeneric<P extends Partial<ModelAttributes<InstanceType<T>>>>(
    data: P,
    trx?: TransactionClientContract
  ) {
    const instance = new this.model()
    if (trx) instance.useTransaction(trx)
    instance.fill(data)
    return instance.save()
  }

  public async deleteGeneric(id: any, trx?: TransactionClientContract) {
    const instance = await this.findById(id)
    if (!instance) throw new Error(`${this.model.name} not found`)
    if (trx) instance.useTransaction(trx)
    await instance.delete()
  }

  public async deleteBulk(ids: any[]) {
    return await this.model.query().whereIn('id', ids).delete()
  }

  public async updateOrCreateGeneric<P extends Partial<ModelAttributes<InstanceType<T>>>>(data: P) {
    const { id, ...rest } = data as { id?: string | number }
    const filter = id ? ({ id } as unknown as Partial<ModelAttributes<InstanceType<T>>>) : {}
    const instance = await this.model.updateOrCreate(filter, rest as P)
    return instance
  }
}
