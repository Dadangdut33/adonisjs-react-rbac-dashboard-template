import Permission from '#models/permission'

export class PermissionDto {
  readonly id: number
  readonly name: string
  readonly is_protected: boolean
  readonly created_at: string // dto needs to be string
  readonly updated_at: string

  constructor(permission: Permission) {
    this.id = permission.id
    this.name = permission.name
    this.is_protected = permission.is_protected
    this.created_at = permission.created_at.toString()
    this.updated_at = permission.updated_at.toString()
  }

  // Collect is for multiple dtos
  static collect(permissions: Permission[]): PermissionDto[] {
    return permissions.map((permission) => new PermissionDto(permission))
  }
}
