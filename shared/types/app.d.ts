import type { RoutesList } from '@adonisjs/core/types/http'

export interface QueryBuilderParams<T extends LucidModel> {
  page?: number
  perPage?: number

  /** global search */
  search?: string

  /** per-column search */
  searchBy?: Partial<Record<keyof ModelAttributes<InstanceType<T>>, string>>

  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  filter?: 'all' | 'images' | 'files' | 'videos' | 'audio'
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

export type RouteNameType = keyof RoutesList['ALL']

// * IMPORTANT *
// Helper for paginated data
// This appear as snake_case because of how we set the naming strategy in each model
export type PaginationMeta = {
  total: number
  per_page: number

  current_page: number
  first_page: number
  last_page: number

  first_page_url: string
  last_page_url: string
  next_page_url: string | null
  previous_page_url: string | null
}
