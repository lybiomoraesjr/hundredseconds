package com.hundredseconds.api.domain.model;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import com.hundredseconds.api.domain.service.ScorePlausibilityPolicy;
import com.hundredseconds.api.domain.service.StarCalculator;

/**
 * Result of a finished match.
 *
 * @param userId null when the match was played by a guest
 */
public record GameScore(Long id, UUID userId, PlayerName playerName, GameMode gameMode, int score, int starsEarned,
		int wrongAnswers, Instant playedAt) {

	public GameScore {
		Objects.requireNonNull(playerName, "playerName must not be null");
		Objects.requireNonNull(gameMode, "gameMode must not be null");
		Objects.requireNonNull(playedAt, "playedAt must not be null");
	}

	/**
	 * Creates a new, validated score. Stars are always derived from the score.
	 */
	public static GameScore create(UUID userId, PlayerName playerName, GameMode gameMode, int score, int wrongAnswers,
			Instant playedAt) {
		ScorePlausibilityPolicy.validate(score, wrongAnswers);
		return new GameScore(null, userId, playerName, gameMode, score, StarCalculator.starsFor(score), wrongAnswers,
				playedAt);
	}

	public boolean isGuest() {
		return userId == null;
	}

}
