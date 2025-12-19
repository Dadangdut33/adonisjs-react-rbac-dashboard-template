export interface QueryBuilderParams<T extends LucidModel> {
  page?: number
  perPage?: number
  search?: string
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  preload?: ExtractModelRelations<InstanceType<T>>[]
  filters?: Partial<ModelAttributes<InstanceType<T>>>
  noPagination?: boolean
  searchRelations?: {
    relation: ExtractModelRelations<InstanceType<T>>
    columns: string[]
  }[]
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
