package com.hundredseconds.api.presentation.exception;

/**
 * Stable error identifiers sent in the "code" property of every error response. The web app translates them into
 * user-facing messages.
 */
public enum ErrorCode {
	VALIDATION_ERROR,
	INVALID_PLAYER_NAME,
	INVALID_EMAIL,
	INVALID_PASSWORD,
	IMPLAUSIBLE_SCORE,
	EMAIL_ALREADY_IN_USE,
	USERNAME_ALREADY_IN_USE,
	INVALID_CREDENTIALS,
	AUTHENTICATION_REQUIRED,
	USER_NOT_FOUND,
	CONFLICT
}
