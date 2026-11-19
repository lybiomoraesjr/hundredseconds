package com.hundredseconds.api.presentation.response;

import java.time.Instant;

public record LeaderboardEntryResponse(int rank, String playerName, int score, Integer durationMs, Instant playedAt) {
}
