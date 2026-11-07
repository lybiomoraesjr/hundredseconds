import type { AuthSession } from '../auth/AuthSession'

export interface RegisterInput {
  readonly username: string
  readonly email: string
  readonly password: string
}

export interface LoginInput {
  readonly email: string
  readonly password: string
}

export interface AuthGateway {
  register(input: RegisterInput): Promise<void>
  login(input: LoginInput): Promise<AuthSession>
}
