export interface AuthSession {
  readonly accessToken: string
  readonly userId: string
  readonly username: string
  /** Token expiration, in epoch milliseconds. */
  readonly expiresAtMs: number
}

export function isExpired(session: AuthSession, nowMs: number): boolean {
  return session.expiresAtMs <= nowMs
}
