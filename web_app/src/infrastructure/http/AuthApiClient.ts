import type { AuthSession } from '../../application/auth/AuthSession'
import type { AuthGateway, LoginInput, RegisterInput } from '../../application/ports/AuthGateway'
import type { HttpClient } from './HttpClient'

interface LoginResponse {
  readonly accessToken: string
  readonly userId: string
  readonly username: string
}

export class AuthApiClient implements AuthGateway {
  private readonly http: HttpClient

  constructor(http: HttpClient) {
    this.http = http
  }

  async register(input: RegisterInput): Promise<void> {
    await this.http.post('/api/auth/register', { body: input })
  }

  async login(input: LoginInput): Promise<AuthSession> {
    const response = await this.http.post<LoginResponse>('/api/auth/login', { body: input })
    return {
      accessToken: response.accessToken,
      userId: response.userId,
      username: response.username,
      expiresAtMs: readExpiration(response.accessToken),
    }
  }
}

/** Reads the "exp" claim (seconds) of a JWT. Signature is validated by the API, not here. */
export function readExpiration(token: string): number {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const { exp } = JSON.parse(atob(payload)) as { exp?: number }
    return typeof exp === 'number' ? exp * 1000 : 0
  } catch {
    return 0
  }
}
