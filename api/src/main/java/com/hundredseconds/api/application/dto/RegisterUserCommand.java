package com.hundredseconds.api.application.dto;

public record RegisterUserCommand(String username, String email, String password) {
}
