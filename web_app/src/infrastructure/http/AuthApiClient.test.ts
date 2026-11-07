import { describe, expect, it, vi } from 'vitest'
import { AuthApiClient, readExpiration } from './AuthApiClient'
import { HttpClient } from './HttpClient'

const base64Url = (value: object) =>
  btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const tokenWith = (payload: object) => `${base64Url({ alg: 'HS256' })}.${base64Url(payload)}.signature`

describe('AuthApiClient', () => {
  it('logs in and builds the session from the response and the token expiration', async () => {
    const token = tokenWith({ sub: 'user-1', exp: 1_800_000_000 })
    const fetchFn = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      accessToken: token, tokenType: 'Bearer', userId: 'user-1', username: 'Ana',
    }), { status: 200 }))
    const client = new AuthApiClient(new HttpClient({ fetchFn }))

    const session = await client.login({ email: 'ana@mail.com', password: 'secret123' })

    expect(session).toEqual({ accessToken: token, userId: 'user-1', username: 'Ana', expiresAtMs: 1_800_000_000_000 })
    expect(fetchFn.mock.calls[0][0]).toBe('/api/auth/login')
  })

  it('registers by posting the form', async () => {
    const fetchFn = vi.fn().mockResolvedValue(new Response('{}', { status: 201 }))
    await new AuthApiClient(new HttpClient({ fetchFn }))
      .register({ username: 'Ana', email: 'ana@mail.com', password: 'secret123' })
    expect(JSON.parse(fetchFn.mock.calls[0][1].body)).toEqual({ username: 'Ana', email: 'ana@mail.com', password: 'secret123' })
  })

  it('treats malformed tokens as already expired', () => {
    expect(readExpiration('not-a-jwt')).toBe(0)
    expect(readExpiration(tokenWith({ sub: 'x' }))).toBe(0)
  })
})
