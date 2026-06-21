import { createTuyau } from '@tuyau/core/client'
import { registry } from '~registry'

export const tuyauClient = createTuyau({
  baseUrl: import.meta.env.VITE_API_URL ?? 'https://localhost:3333',
  registry,
})

export const urlFor = tuyauClient.urlFor
