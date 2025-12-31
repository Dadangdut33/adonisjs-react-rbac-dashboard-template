// types/filters.ts
export interface TableFilterProps {
  column: string
  label?: string
  description?: string
  searchFilter: any // The object returned by useSearchFilter
  close?: () => void // Optional: used to close the filter popover
}
