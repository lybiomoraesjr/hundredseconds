package com.hundredseconds.api.application.dto;

import java.time.Instant;

import com.hundredseconds.api.domain.model.GameMode;

public record SavedScoreResult(Long id, String playerName, GameMode gameMode, int score, int starsEarned,
		int wrongAnswers, Instant playedAt) {
}
