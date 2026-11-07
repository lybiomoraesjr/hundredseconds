import { ApiError } from '../../infrastructure/http/ApiError'
import { messages } from './messages'

/** Translates any error into a user-facing pt-BR message using the API "code". */
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return messages.errors[error.code] ?? messages.errors.UNKNOWN_ERROR
  }
  return messages.errors.UNKNOWN_ERROR
}
