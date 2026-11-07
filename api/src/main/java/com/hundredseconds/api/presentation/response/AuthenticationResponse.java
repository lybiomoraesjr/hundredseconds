package com.hundredseconds.api.presentation.response;

import java.util.UUID;

public record AuthenticationResponse(String accessToken, String tokenType, UUID userId, String username) {
}
