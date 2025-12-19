// We make some predefined roles that should always be there
// The rest of the roles can be created dynamically from the admin panel
// Or if you want, you can create more from seeders
export enum PreDefinedRolesId {
  USER = 1,
  ADMIN = 2,
  SUPER_ADMIN = 3,
}

export const PreDefinedRoleMap: Record<string, number> = {
  USER: PreDefinedRolesId.USER,
  ADMIN: PreDefinedRolesId.ADMIN,
  SUPER_ADMIN: PreDefinedRolesId.SUPER_ADMIN,
}

export type PreDefinedRoleNameType = keyof typeof PreDefinedRolesId

export default PreDefinedRolesId
