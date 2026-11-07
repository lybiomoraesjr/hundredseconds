package com.hundredseconds.api.infrastructure.security;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

class BCryptPasswordHasherTests {

	private final BCryptPasswordHasher hasher = new BCryptPasswordHasher(new BCryptPasswordEncoder(4));

	@Test
	void shouldHashAndMatchPassword() {
		String hash = hasher.hash("secret123");

		assertThat(hash).isNotEqualTo("secret123").startsWith("$2");
		assertThat(hasher.matches("secret123", hash)).isTrue();
		assertThat(hasher.matches("wrong", hash)).isFalse();
	}

}
