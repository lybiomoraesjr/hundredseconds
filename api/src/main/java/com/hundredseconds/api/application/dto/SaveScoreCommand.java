package com.hundredseconds.api.application.dto;

import java.util.UUID;

import com.hundredseconds.api.domain.model.GameMode;

/**
 * @param userId    authenticated user, or null for guests
 * @param guestName name informed by a guest; ignored when userId is present
 */
public record SaveScoreCommand(UUID userId, String guestName, GameMode gameMode, int score, int wrongAnswers) {
}
