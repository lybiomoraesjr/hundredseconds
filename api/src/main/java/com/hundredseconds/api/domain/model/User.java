package com.hundredseconds.api.domain.model;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/**
 * Registered player.
 */
public record User(UUID id, String username, String email, String passwordHash, Instant createdAt) {

	public User {
		Objects.requireNonNull(username, "username must not be null");
		Objects.requireNonNull(email, "email must not be null");
		Objects.requireNonNull(passwordHash, "passwordHash must not be null");
	}

	/**
	 * Creates a user that has not been persisted yet.
	 */
	public static User newUser(String username, String email, String passwordHash, Instant createdAt) {
		return new User(null, username, email, passwordHash, createdAt);
	}

}
