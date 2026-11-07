package com.hundredseconds.api.presentation.response;

import java.time.Instant;

import com.hundredseconds.api.domain.model.GameMode;

public record SavedScoreResponse(Long id, String playerName, GameMode gameMode, int score, int starsEarned,
		int wrongAnswers, Instant playedAt) {
}
