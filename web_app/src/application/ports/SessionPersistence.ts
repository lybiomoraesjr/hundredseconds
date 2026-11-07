import type { AuthSession } from '../auth/AuthSession'

/** Keeps the session between page reloads. */
export interface SessionPersistence {
  load(): AuthSession | null
  save(session: AuthSession): void
  clear(): void
}
