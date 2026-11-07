package com.hundredseconds.api.presentation.response;

import java.util.UUID;

public record RegisteredUserResponse(UUID id, String username, String email) {
}
