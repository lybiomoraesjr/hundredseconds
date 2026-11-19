package com.hundredseconds.api.domain.model;

import java.time.Instant;

/**
 * A single row of the leaderboard, as returned by the repository (already ordered).
 *
 * @param durationMs null for the 100 second games
 */
public record LeaderboardEntry(String playerName, int score, Integer durationMs, Instant playedAt) {
}
