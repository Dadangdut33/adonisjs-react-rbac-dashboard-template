import type {
  loginValidator,
  registerValidator,
  resetPasswordValidator,
} from '#validators/auth/auth'
import type { createEditPermissionValidator } from '#validators/auth/permission'
import type { createEditRoleValidator } from '#validators/auth/role'
import type { createEditBlogValidator } from '#validators/blog'
import type { createProfileValidator, updateProfileValidator } from '#validators/profile'
import type { createEditUserValidator } from '#validators/user'

import type { Infer } from '@vinejs/vine/types'

export type RegisterPayload = Infer<typeof registerValidator>
export type LoginPayload = Infer<typeof loginValidator>
export type ResetPasswordPayload = Infer<typeof resetPasswordValidator>

export type UserPayload = Infer<typeof createEditUserValidator>
export type RolePayload = Infer<typeof createEditRoleValidator>
export type PermissionPayload = Infer<typeof createEditPermissionValidator>
export type BlogPayload = Infer<typeof createEditBlogValidator>

export type UpdateProfilePayload = Infer<typeof updateProfileValidator>
export type CreateProfilePayload = Infer<typeof createProfileValidator>
