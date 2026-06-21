import type User from '#models/user'

export class UserShortDto {
  readonly id: string
  readonly username: string
  readonly full_name: string
  readonly avatar_url: string | null

  constructor(user: User) {
    this.id = user.id
    this.username = user.username
    this.full_name = user.full_name
    this.avatar_url = user.profile?.avatarUrl || null
  }

  static collect(users: User[]): UserShortDto[] {
    return users.map((user) => new UserShortDto(user))
  }
}
