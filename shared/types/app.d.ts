import type { RouteWithName, RouteWithParams } from '@izzyjs/route/routes'

export interface QueryBuilderParams<T extends LucidModel> {
  page?: number
  perPage?: number

  /** global search */
  search?: string

  /** per-column search */
  searchBy?: Partial<Record<keyof ModelAttributes<InstanceType<T>>, string>>

  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  preload?: ExtractModelRelations<InstanceType<T>>[]
  filters?: Partial<ModelAttributes<InstanceType<T>>>

  // backend-defined list of column that can be searched in global search
  searchRelations?: {
    relation: ExtractModelRelations<InstanceType<T>>
    columns: string[]
  }[]

  // backend-defined whitelist | if defined only this columns are searchable
  searchableCol?: string[]

  // backend-defined whitelist | if defined only these columns are sortable
  sortableCol?: string[]

  sortableRelations?: {
    relation: ExtractModelRelations<InstanceType<T>>
    column: string
    /**
     * How to resolve multiple rows (many-to-many)
     * default: MIN
     */
    aggregate?: 'min' | 'max'
  }[]

  select?: (keyof ModelAttributes<InstanceType<T>>)[]
  exclude?: (keyof ModelAttributes<InstanceType<T>>)[] // only work for current table

  selectPreload?: string[] // e.g. ['profile:id,user_id,avatar_id', 'profile.avatar:id,url']
  excludePreload?: string[] // e.g. ['profile.bio', 'profile.avatar.metadata']
}

export type ValidationError = {
  message: string
  rule: string
  field: string
}

export type RequestError = {
  status: number
  code: string
  messages: ValidationError[]
}

export type FlashAlertType = {
  success?: string
  error?: string
  info?: string
  warning?: string
}

// Helper for routename type - we copy pasted it from izzyjs
export type RouteNameType = Exclude<RouteWithName, RouteWithParams>['name']

// Helper for paginated data
export type PaginationMeta = {
  current_page: number
  per_page: number
  total: number

  first_page: number
  first_page_url: string

  last_page: number
  last_page_url: string

  next_page_url: string | null
  prev_page_url: string | null
}
