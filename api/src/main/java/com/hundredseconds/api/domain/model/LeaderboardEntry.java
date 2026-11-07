package com.hundredseconds.api.domain.model;

import java.time.Instant;

/**
 * A single row of the leaderboard, as returned by the repository (already ordered).
 */
public record LeaderboardEntry(String playerName, int score, Instant playedAt) {
}
