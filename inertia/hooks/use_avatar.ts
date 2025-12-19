import { BaseAPIResponse } from '#types/api'

import { route } from '@izzyjs/route/client'
import { useQuery } from '@tanstack/react-query'
import { api } from '~/lib/axios'

async function fetchAvatar(): Promise<string | undefined> {
  const { data } = await api.get<BaseAPIResponse<string>>(route('api.v1.me.avatar').path)

  return data.data
}

export function useAvatar() {
  const { data } = useQuery({
    queryKey: ['me', 'avatar'],
    queryFn: fetchAvatar,
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: false,
  })

  return data
}
