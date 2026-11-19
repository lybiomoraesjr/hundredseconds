package com.hundredseconds.api.domain.model;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import com.hundredseconds.api.domain.service.ScorePlausibilityPolicy;
import com.hundredseconds.api.domain.service.StarCalculator;

/**
 * Result of a finished match.
 *
 * @param userId     null when the match was played by a guest
 * @param durationMs how long a time trial took; null for the 100 second games
 */
public record GameScore(Long id, UUID userId, PlayerName playerName, GameMode gameMode, int score, int starsEarned,
		int wrongAnswers, Integer durationMs, Instant playedAt) {

	public GameScore {
		Objects.requireNonNull(playerName, "playerName must not be null");
		Objects.requireNonNull(gameMode, "gameMode must not be null");
		Objects.requireNonNull(playedAt, "playedAt must not be null");
	}

	/**
	 * Creates a new, validated score. Stars are always derived from the score.
	 */
	public static GameScore create(UUID userId, PlayerName playerName, GameMode gameMode, int score, int wrongAnswers,
			Integer durationMs, Instant playedAt) {
		ScorePlausibilityPolicy.validate(gameMode, score, wrongAnswers, durationMs);
		return new GameScore(null, userId, playerName, gameMode, score, StarCalculator.starsFor(score), wrongAnswers,
				durationMs, playedAt);
	}

	/** A 100 second game, which has no duration. */
	public static GameScore create(UUID userId, PlayerName playerName, GameMode gameMode, int score, int wrongAnswers,
			Instant playedAt) {
		return create(userId, playerName, gameMode, score, wrongAnswers, null, playedAt);
	}

	public boolean isGuest() {
		return userId == null;
	}

}
