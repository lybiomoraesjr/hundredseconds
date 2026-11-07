package com.hundredseconds.api.presentation.exception;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import com.hundredseconds.api.domain.exception.AuthenticationRequiredException;
import com.hundredseconds.api.domain.exception.DomainException;
import com.hundredseconds.api.domain.exception.EmailAlreadyInUseException;
import com.hundredseconds.api.domain.exception.ImplausibleScoreException;
import com.hundredseconds.api.domain.exception.InvalidCredentialsException;
import com.hundredseconds.api.domain.exception.InvalidEmailException;
import com.hundredseconds.api.domain.exception.InvalidPasswordException;
import com.hundredseconds.api.domain.exception.InvalidPlayerNameException;
import com.hundredseconds.api.domain.exception.UserNotFoundException;
import com.hundredseconds.api.domain.exception.UsernameAlreadyInUseException;

/**
 * Translates exceptions into RFC 9457 problem details with an extra "code" property.
 */
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

	private static final String CODE_PROPERTY = "code";

	private record Mapping(HttpStatus status, ErrorCode code) {
	}

	private static final Map<Class<? extends DomainException>, Mapping> DOMAIN_MAPPINGS = Map.of(
			InvalidPlayerNameException.class, new Mapping(HttpStatus.BAD_REQUEST, ErrorCode.INVALID_PLAYER_NAME),
			InvalidEmailException.class, new Mapping(HttpStatus.BAD_REQUEST, ErrorCode.INVALID_EMAIL),
			InvalidPasswordException.class, new Mapping(HttpStatus.BAD_REQUEST, ErrorCode.INVALID_PASSWORD),
			ImplausibleScoreException.class, new Mapping(HttpStatus.UNPROCESSABLE_CONTENT, ErrorCode.IMPLAUSIBLE_SCORE),
			EmailAlreadyInUseException.class, new Mapping(HttpStatus.CONFLICT, ErrorCode.EMAIL_ALREADY_IN_USE),
			UsernameAlreadyInUseException.class, new Mapping(HttpStatus.CONFLICT, ErrorCode.USERNAME_ALREADY_IN_USE),
			InvalidCredentialsException.class, new Mapping(HttpStatus.UNAUTHORIZED, ErrorCode.INVALID_CREDENTIALS),
			AuthenticationRequiredException.class,
			new Mapping(HttpStatus.UNAUTHORIZED, ErrorCode.AUTHENTICATION_REQUIRED),
			UserNotFoundException.class, new Mapping(HttpStatus.NOT_FOUND, ErrorCode.USER_NOT_FOUND));

	@ExceptionHandler(DomainException.class)
	ProblemDetail handleDomainException(DomainException exception) {
		Mapping mapping = DOMAIN_MAPPINGS.getOrDefault(exception.getClass(),
				new Mapping(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR));
		return problem(mapping.status(), mapping.code(), exception.getMessage());
	}

	@ExceptionHandler(MethodArgumentTypeMismatchException.class)
	ProblemDetail handleTypeMismatch(MethodArgumentTypeMismatchException exception) {
		return problem(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR,
				"Invalid value for parameter '" + exception.getName() + "'");
	}

	/** Unique constraint race (e.g. two simultaneous registrations with the same e-mail). */
	@ExceptionHandler(DataIntegrityViolationException.class)
	ProblemDetail handleDataIntegrityViolation(DataIntegrityViolationException exception) {
		return problem(HttpStatus.CONFLICT, ErrorCode.CONFLICT, "The data conflicts with an existing record");
	}

	@Override
	protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException exception,
			HttpHeaders headers, HttpStatusCode status, WebRequest request) {
		Map<String, String> errors = new LinkedHashMap<>();
		exception.getBindingResult()
			.getFieldErrors()
			.forEach(error -> errors.putIfAbsent(error.getField(), error.getDefaultMessage()));
		ProblemDetail problem = problem(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR, "Invalid request");
		problem.setProperty("errors", errors);
		return ResponseEntity.badRequest().body(problem);
	}

	@Override
	protected ResponseEntity<Object> handleHttpMessageNotReadable(HttpMessageNotReadableException exception,
			HttpHeaders headers, HttpStatusCode status, WebRequest request) {
		return ResponseEntity.badRequest()
			.body(problem(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR, "Malformed request body"));
	}

	private static ProblemDetail problem(HttpStatus status, ErrorCode code, String detail) {
		ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, detail);
		problem.setProperty(CODE_PROPERTY, code.name());
		return problem;
	}

}
