package com.hundredseconds.api.domain.exception;

/**
 * Base class for business rule violations.
 */
public abstract class DomainException extends RuntimeException {

	protected DomainException(String message) {
		super(message);
	}

}
