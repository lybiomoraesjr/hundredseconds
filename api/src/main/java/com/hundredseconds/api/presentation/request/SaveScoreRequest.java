package com.hundredseconds.api.presentation.request;

import com.hundredseconds.api.domain.model.GameMode;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * @param playerName required for guests only; ignored for authenticated players
 * @param durationMs required for time trials only; must be absent for the 100 second games
 */
public record SaveScoreRequest(
		@NotNull GameMode gameMode,
		@NotNull @Min(0) Integer score,
		@NotNull @Min(0) Integer wrongAnswers,
		@Size(max = 50) String playerName,
		@Min(1) Integer durationMs) {
}
