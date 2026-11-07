package com.hundredseconds.api.application.dto;

import java.util.UUID;

public record AuthenticationResult(String accessToken, UUID userId, String username) {
}
