package com.hundredseconds.api.application.usecase;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.hundredseconds.api.application.dto.AuthenticationResult;
import com.hundredseconds.api.application.dto.LoginCommand;
import com.hundredseconds.api.application.port.PasswordHasher;
import com.hundredseconds.api.application.port.TokenIssuer;
import com.hundredseconds.api.domain.exception.InvalidCredentialsException;
import com.hundredseconds.api.domain.model.User;
import com.hundredseconds.api.domain.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class LoginUseCaseTests {

	private static final User ANA = new User(UUID.randomUUID(), "Ana", "ana@mail.com", "hashed",
			Instant.parse("2026-01-01T00:00:00Z"));

	@Mock
	private UserRepository userRepository;

	@Mock
	private PasswordHasher passwordHasher;

	@Mock
	private TokenIssuer tokenIssuer;

	private LoginUseCase useCase;

	@BeforeEach
	void setUp() {
		useCase = new LoginUseCase(userRepository, passwordHasher, tokenIssuer);
	}

	@Test
	void shouldReturnTokenForValidCredentials() {
		when(userRepository.findByEmail("ana@mail.com")).thenReturn(Optional.of(ANA));
		when(passwordHasher.matches("secret123", "hashed")).thenReturn(true);
		when(tokenIssuer.issue(ANA)).thenReturn("jwt-token");

		AuthenticationResult result = useCase.execute(new LoginCommand(" ANA@mail.com ", "secret123"));

		assertThat(result).isEqualTo(new AuthenticationResult("jwt-token", ANA.id(), "Ana"));
	}

	@Test
	void shouldRejectWrongPassword() {
		when(userRepository.findByEmail("ana@mail.com")).thenReturn(Optional.of(ANA));
		when(passwordHasher.matches("wrong", "hashed")).thenReturn(false);

		assertThatThrownBy(() -> useCase.execute(new LoginCommand("ana@mail.com", "wrong")))
			.isInstanceOf(InvalidCredentialsException.class);
	}

	@Test
	void shouldRejectUnknownEmailWithSameError() {
		when(userRepository.findByEmail("ghost@mail.com")).thenReturn(Optional.empty());

		assertThatThrownBy(() -> useCase.execute(new LoginCommand("ghost@mail.com", "secret123")))
			.isInstanceOf(InvalidCredentialsException.class)
			.hasMessage("Invalid e-mail or password");
	}

	@Test
	void shouldRejectMissingFields() {
		assertThatThrownBy(() -> useCase.execute(new LoginCommand(null, null)))
			.isInstanceOf(InvalidCredentialsException.class);
	}

}
