import type { BaseAPIResponse } from '#types/api'

import { useQuery } from '@tanstack/react-query'
import { api } from '~/lib/axios'
import { urlFor } from '~/lib/client'

async function fetchAvatar(): Promise<string | null> {
  const { data } = await api.get<BaseAPIResponse<string>>(urlFor('api.v1.me.avatar'))

  return data.data ?? null
}

export function useAvatar() {
  const { data } = useQuery({
    queryKey: ['me', 'avatar'],
    queryFn: fetchAvatar,
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: false,
  })

  return data ?? undefined
}
