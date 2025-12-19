import { router } from '@inertiajs/core'
import { route } from '@izzyjs/route/client'
import { useMutation } from '@tanstack/react-query'
import { NotifySuccess } from '~/components/core/notify'
import { api } from '~/lib/axios'

async function logoutRequest() {
  await api.post(route('auth.logout').path)
}

export function useLogout() {
  return useMutation({
    mutationFn: logoutRequest,
    onSuccess: () => {
      NotifySuccess('Success', 'Logged out successfully')
      router.visit(route('auth.login').path)
    },
  })
}
