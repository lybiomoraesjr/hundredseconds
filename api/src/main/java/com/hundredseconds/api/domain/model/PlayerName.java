package com.hundredseconds.api.domain.model;

import com.hundredseconds.api.domain.exception.InvalidPlayerNameException;

/**
 * Name displayed on the leaderboard. Trimmed, between 1 and 50 characters.
 */
public record PlayerName(String value) {

	public static final int MAX_LENGTH = 50;

	public PlayerName {
		if (value == null || value.isBlank()) {
			throw new InvalidPlayerNameException("Player name must not be blank");
		}
		value = value.strip();
		if (value.length() > MAX_LENGTH) {
			throw new InvalidPlayerNameException("Player name must have at most " + MAX_LENGTH + " characters");
		}
	}

}
