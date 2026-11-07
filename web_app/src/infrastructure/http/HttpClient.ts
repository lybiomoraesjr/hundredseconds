import { ApiError, type ApiErrorCode } from './ApiError'

interface RequestOptions {
  readonly body?: unknown
  readonly token?: string | null
  readonly query?: Readonly<Record<string, string>>
}

interface ProblemDetails {
  readonly code?: string
  readonly detail?: string
  readonly errors?: Record<string, string>
}

/**
 * Small fetch wrapper: JSON in/out, bearer token and problem details parsing.
 */
export class HttpClient {
  private readonly baseUrl: string
  private readonly fetchFn: typeof fetch
  private readonly onUnauthorized: () => void

  constructor(options: { baseUrl?: string; fetchFn?: typeof fetch; onUnauthorized?: () => void } = {}) {
    this.baseUrl = options.baseUrl ?? ''
    this.fetchFn = options.fetchFn ?? ((...args) => fetch(...args))
    this.onUnauthorized = options.onUnauthorized ?? (() => {})
  }

  get<T>(path: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('GET', path, options)
  }

  post<T>(path: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('POST', path, options)
  }

  private async request<T>(method: string, path: string, { body, token, query }: RequestOptions): Promise<T> {
    const headers: Record<string, string> = { Accept: 'application/json' }
    if (body !== undefined) headers['Content-Type'] = 'application/json'
    if (token) headers.Authorization = `Bearer ${token}`
    const url = `${this.baseUrl}${path}${query ? `?${new URLSearchParams(query)}` : ''}`

    let response: Response
    try {
      response = await this.fetchFn(url, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      })
    } catch {
      throw new ApiError(0, 'NETWORK_ERROR', 'Could not reach the server')
    }

    if (!response.ok) {
      // A rejected token means the session is no longer valid
      if (response.status === 401 && token) this.onUnauthorized()
      throw await toApiError(response)
    }
    const text = await response.text()
    return (text ? JSON.parse(text) : undefined) as T
  }
}

async function toApiError(response: Response): Promise<ApiError> {
  let problem: ProblemDetails = {}
  try {
    problem = (await response.json()) as ProblemDetails
  } catch {
    // Body is empty or not JSON (e.g. 401 from the security filter)
  }
  const code = (problem.code as ApiErrorCode | undefined)
    ?? (response.status === 401 ? 'AUTHENTICATION_REQUIRED' : 'UNKNOWN_ERROR')
  return new ApiError(response.status, code, problem.detail ?? response.statusText, problem.errors ?? {})
}
