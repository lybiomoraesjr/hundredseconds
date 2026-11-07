import { describe, expect, it, vi } from 'vitest'
import { ApiError } from './ApiError'
import { HttpClient } from './HttpClient'

const jsonResponse = (status: number, body: unknown) =>
  new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

describe('HttpClient', () => {
  it('sends JSON with the bearer token and query string', async () => {
    const fetchFn = vi.fn().mockImplementation(async () => jsonResponse(200, { ok: true }))
    const client = new HttpClient({ baseUrl: 'http://api', fetchFn })

    const result = await client.get('/api/scores/summary', { query: { mode: 'EXPONENTIATION' }, token: 'abc' })

    expect(result).toEqual({ ok: true })
    const [url, init] = fetchFn.mock.calls[0]
    expect(url).toBe('http://api/api/scores/summary?mode=EXPONENTIATION')
    expect(init.headers.Authorization).toBe('Bearer abc')

    await client.post('/api/scores', { body: { score: 1 } })
    const [, postInit] = fetchFn.mock.calls[1]
    expect(postInit).toMatchObject({ method: 'POST', body: '{"score":1}' })
    expect(postInit.headers['Content-Type']).toBe('application/json')
    expect(postInit.headers.Authorization).toBeUndefined()
  })

  it('turns problem details into ApiError with code and field errors', async () => {
    const fetchFn = vi.fn().mockResolvedValue(jsonResponse(400, {
      status: 400, code: 'VALIDATION_ERROR', detail: 'Invalid request', errors: { email: 'must be valid' },
    }))
    const client = new HttpClient({ fetchFn })

    const error = await client.post('/api/auth/register', { body: {} }).catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 400, code: 'VALIDATION_ERROR', fieldErrors: { email: 'must be valid' } })
  })

  it('reports network failures as NETWORK_ERROR', async () => {
    const client = new HttpClient({ fetchFn: vi.fn().mockRejectedValue(new TypeError('Failed to fetch')) })
    await expect(client.get('/api/x')).rejects.toMatchObject({ status: 0, code: 'NETWORK_ERROR' })
  })

  it('notifies a rejected token and maps an empty 401 body', async () => {
    const onUnauthorized = vi.fn()
    const client = new HttpClient({ fetchFn: vi.fn().mockResolvedValue(new Response(null, { status: 401 })), onUnauthorized })

    await expect(client.get('/api/x', { token: 'expired' })).rejects.toMatchObject({ code: 'AUTHENTICATION_REQUIRED' })
    expect(onUnauthorized).toHaveBeenCalledTimes(1)

    await expect(client.post('/api/auth/login')).rejects.toBeInstanceOf(ApiError)
    // No token sent: wrong credentials must not be treated as an expired session
    expect(onUnauthorized).toHaveBeenCalledTimes(1)
  })

  it('accepts empty successful responses', async () => {
    const client = new HttpClient({ fetchFn: vi.fn().mockResolvedValue(new Response(null, { status: 201 })) })
    await expect(client.post('/api/scores')).resolves.toBeUndefined()
  })
})
