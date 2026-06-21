import { router } from '@inertiajs/core'
import { useMutation } from '@tanstack/react-query'
import { NotifySuccess } from '~/components/core/notify'
import { api } from '~/lib/axios'
import { urlFor } from '~/lib/client'

async function logoutRequest() {
  await api.post(urlFor('auth.logout'))
}

export function useLogout() {
  return useMutation({
    mutationFn: logoutRequest,
    onSuccess: () => {
      NotifySuccess('Success', 'Logged out successfully')
      router.visit(urlFor('auth.login'))
    },
  })
}
