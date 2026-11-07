package com.hundredseconds.api.presentation.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
		@NotBlank @Size(max = 50) String username,
		@NotBlank @Email @Size(max = 100) String email,
		// BCrypt only uses the first 72 bytes
		@NotBlank @Size(min = 6, max = 72) String password) {
}
