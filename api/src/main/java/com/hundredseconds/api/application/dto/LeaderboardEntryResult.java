package com.hundredseconds.api.application.dto;

import java.time.Instant;

public record LeaderboardEntryResult(int rank, String playerName, int score, Integer durationMs, Instant playedAt) {
}
