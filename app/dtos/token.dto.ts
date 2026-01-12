import Token from '#models/token'
import { TokenType } from '#types/models'

export class TokenDto {
  readonly id: string
  readonly type: TokenType | string
  readonly token: string
  readonly expires_at: string | null
  readonly created_at: string
  readonly updated_at: string

  constructor(token: Token) {
    this.id = token.id
    this.type = token.type
    this.token = token.token
    this.expires_at = token.expires_at ? token.expires_at.toString() : null
    this.created_at = token.created_at ? token.created_at.toString() : ''
    this.updated_at = token.updated_at ? token.updated_at.toString() : ''
  }

  // Collect is for multiple dtos
  static collect(tokens: Token[]): TokenDto[] {
    return tokens.map((token) => new TokenDto(token))
  }
}
