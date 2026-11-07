package com.hundredseconds.api.presentation.controller;

import java.util.UUID;

import org.springframework.security.oauth2.jwt.Jwt;

/**
 * Extracts the player id from the (optional) JWT.
 */
final class CurrentUser {

	private CurrentUser() {
	}

	/**
	 * @return the user id, or null for guests
	 */
	static UUID idOf(Jwt jwt) {
		return jwt == null ? null : UUID.fromString(jwt.getSubject());
	}

}
