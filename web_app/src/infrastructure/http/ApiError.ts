/** Error codes sent by the API ("code" property of the problem details) plus client-side ones. */
export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'INVALID_PLAYER_NAME'
  | 'INVALID_EMAIL'
  | 'INVALID_PASSWORD'
  | 'IMPLAUSIBLE_SCORE'
  | 'EMAIL_ALREADY_IN_USE'
  | 'USERNAME_ALREADY_IN_USE'
  | 'INVALID_CREDENTIALS'
  | 'AUTHENTICATION_REQUIRED'
  | 'USER_NOT_FOUND'
  | 'CONFLICT'
  /** Server unreachable */
  | 'NETWORK_ERROR'
  /** Unexpected status without a known code */
  | 'UNKNOWN_ERROR'

export class ApiError extends Error {
  readonly status: number
  readonly code: ApiErrorCode
  /** Field name -> message, for validation errors. */
  readonly fieldErrors: Readonly<Record<string, string>>

  constructor(status: number, code: ApiErrorCode, message: string, fieldErrors: Record<string, string> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fieldErrors = fieldErrors
  }
}
