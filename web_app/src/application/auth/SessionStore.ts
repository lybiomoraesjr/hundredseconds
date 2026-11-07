import type { SessionPersistence } from '../ports/SessionPersistence'
import { isExpired, type AuthSession } from './AuthSession'

type Listener = () => void

/**
 * Holds the logged player. Framework-free, React subscribes through useSyncExternalStore.
 */
export class SessionStore {
  private session: AuthSession | null
  private readonly listeners = new Set<Listener>()
  private readonly persistence: SessionPersistence
  private readonly now: () => number

  constructor(persistence: SessionPersistence, now: () => number = Date.now) {
    this.persistence = persistence
    this.now = now
    const stored = persistence.load()
    this.session = stored && !isExpired(stored, now()) ? stored : null
    if (stored && !this.session) persistence.clear()
  }

  /** Returns the session, dropping it if the token has expired meanwhile. */
  getSession = (): AuthSession | null => {
    if (this.session && isExpired(this.session, this.now())) {
      this.clear()
    }
    return this.session
  }

  setSession(session: AuthSession): void {
    this.session = session
    this.persistence.save(session)
    this.notify()
  }

  clear(): void {
    if (this.session === null) return
    this.session = null
    this.persistence.clear()
    this.notify()
  }

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener())
  }
}
