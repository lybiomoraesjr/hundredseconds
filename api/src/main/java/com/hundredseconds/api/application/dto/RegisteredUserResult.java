package com.hundredseconds.api.application.dto;

import java.util.UUID;

public record RegisteredUserResult(UUID id, String username, String email) {
}
