import { describe, expect, it, vi } from 'vitest'
import type { AuthSession } from './AuthSession'
import { SessionStore } from './SessionStore'

const NOW = 1_000_000
const session = (expiresAtMs: number): AuthSession => ({ accessToken: 't', userId: 'u', username: 'Ana', expiresAtMs })

const persistenceWith = (stored: AuthSession | null) => ({
  load: vi.fn(() => stored),
  save: vi.fn(),
  clear: vi.fn(),
})

describe('SessionStore', () => {
  it('restores a valid stored session', () => {
    const store = new SessionStore(persistenceWith(session(NOW + 1000)), () => NOW)
    expect(store.getSession()?.username).toBe('Ana')
  })

  it('discards an expired stored session', () => {
    const persistence = persistenceWith(session(NOW - 1))
    const store = new SessionStore(persistence, () => NOW)
    expect(store.getSession()).toBeNull()
    expect(persistence.clear).toHaveBeenCalled()
  })

  it('drops the session when it expires while the page is open', () => {
    let now = NOW
    const store = new SessionStore(persistenceWith(null), () => now)
    store.setSession(session(NOW + 1000))
    now = NOW + 1000
    expect(store.getSession()).toBeNull()
  })

  it('persists and notifies on login and logout', () => {
    const persistence = persistenceWith(null)
    const store = new SessionStore(persistence, () => NOW)
    const listener = vi.fn()
    const unsubscribe = store.subscribe(listener)

    store.setSession(session(NOW + 1000))
    expect(persistence.save).toHaveBeenCalled()
    store.clear()
    expect(persistence.clear).toHaveBeenCalled()
    expect(listener).toHaveBeenCalledTimes(2)

    unsubscribe()
    store.setSession(session(NOW + 1000))
    expect(listener).toHaveBeenCalledTimes(2)
  })
})
