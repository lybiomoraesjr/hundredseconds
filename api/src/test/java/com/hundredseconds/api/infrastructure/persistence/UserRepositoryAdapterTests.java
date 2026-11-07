package com.hundredseconds.api.infrastructure.persistence;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import com.hundredseconds.api.IntegrationTest;
import com.hundredseconds.api.domain.model.User;
import com.hundredseconds.api.domain.repository.UserRepository;

@IntegrationTest
@Transactional
class UserRepositoryAdapterTests {

	private static final Instant CREATED_AT = Instant.parse("2026-03-15T12:00:00Z");

	@Autowired
	private UserRepository userRepository;

	@Test
	void shouldSaveAndFindUser() {
		User saved = userRepository.save(User.newUser("Ana", "ana@mail.com", "hashed", CREATED_AT));

		assertThat(saved.id()).isNotNull();
		assertThat(userRepository.findById(saved.id())).contains(saved);
		assertThat(userRepository.findByEmail("ana@mail.com")).contains(saved);
		assertThat(userRepository.existsByEmail("ana@mail.com")).isTrue();
		assertThat(userRepository.existsByUsername("Ana")).isTrue();
	}

	@Test
	void shouldReportMissingUser() {
		assertThat(userRepository.findByEmail("ghost@mail.com")).isEmpty();
		assertThat(userRepository.existsByEmail("ghost@mail.com")).isFalse();
		assertThat(userRepository.existsByUsername("Ghost")).isFalse();
	}

}
