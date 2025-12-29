import { loginValidator, registerValidator, resetPasswordValidator } from '#validators/auth/auth'
import { createEditPermissionValidator } from '#validators/auth/permission'
import { createEditRoleValidator } from '#validators/auth/role'
import { createProfileValidator, updateProfileValidator } from '#validators/profile'
import { createEditUserValidator } from '#validators/user'

import { Infer } from '@vinejs/vine/types'

export type RegisterPayload = Infer<typeof registerValidator>
export type LoginPayload = Infer<typeof loginValidator>
export type ResetPasswordPayload = Infer<typeof resetPasswordValidator>

export type UserPayload = Infer<typeof createEditUserValidator>
export type RolePayload = Infer<typeof createEditRoleValidator>
export type PermissionPayload = Infer<typeof createEditPermissionValidator>

export type UpdateProfilePayload = Infer<typeof updateProfileValidator>
export type CreateProfilePayload = Infer<typeof createProfileValidator>
