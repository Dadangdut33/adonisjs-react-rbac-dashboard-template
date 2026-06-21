import { type JSONDataTypes } from '@adonisjs/core/types/transformers'
import { type PropsWithChildren } from 'react'
import type { Data } from '~data'

export type InertiaProps<T extends JSONDataTypes = {}> = PropsWithChildren<Data.SharedProps & T>
