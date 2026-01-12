export type TokenType = 'PASSWORD_RESET' | 'VERIFY_EMAIL'
export type AuthUser = {
  id: string
  username: string
  full_name: string
  email: string
  is_email_verified: boolean
  permissions: string[]
  roles: string[]
}
