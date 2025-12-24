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
