import type { AuthSession } from '../../application/auth/AuthSession'
import type { SessionPersistence } from '../../application/ports/SessionPersistence'

const STORAGE_KEY = 'hundred-seconds:session'

type SimpleStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export class LocalSessionPersistence implements SessionPersistence {
  private readonly storage: SimpleStorage | null

  constructor(storage?: SimpleStorage | null) {
    this.storage = storage === undefined ? safeLocalStorage() : storage
  }

  load(): AuthSession | null {
    try {
      const raw = this.storage?.getItem(STORAGE_KEY)
      if (!raw) return null
      const parsed = JSON.parse(raw) as Partial<AuthSession>
      const valid = typeof parsed.accessToken === 'string' && typeof parsed.userId === 'string'
        && typeof parsed.username === 'string' && typeof parsed.expiresAtMs === 'number'
      return valid ? (parsed as AuthSession) : null
    } catch {
      return null
    }
  }

  save(session: AuthSession): void {
    try {
      this.storage?.setItem(STORAGE_KEY, JSON.stringify(session))
    } catch {
      // Session then lasts only until the page is reloaded
    }
  }

  clear(): void {
    try {
      this.storage?.removeItem(STORAGE_KEY)
    } catch {
      // Nothing to do
    }
  }
}

function safeLocalStorage(): Storage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}
