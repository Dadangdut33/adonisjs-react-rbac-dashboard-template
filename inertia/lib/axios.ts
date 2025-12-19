import axios from 'axios'

export const api = axios.create({
  withCredentials: true, // required for Adonis session auth
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json',
  },
})
