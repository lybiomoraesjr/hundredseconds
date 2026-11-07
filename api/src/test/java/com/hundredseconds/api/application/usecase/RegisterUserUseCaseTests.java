package com.hundredseconds.api.application.usecase;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.hundredseconds.api.application.dto.RegisterUserCommand;
import com.hundredseconds.api.application.dto.RegisteredUserResult;
import com.hundredseconds.api.application.port.PasswordHasher;
import com.hundredseconds.api.domain.exception.EmailAlreadyInUseException;
import com.hundredseconds.api.domain.exception.InvalidEmailException;
import com.hundredseconds.api.domain.exception.InvalidPasswordException;
import com.hundredseconds.api.domain.exception.InvalidPlayerNameException;
import com.hundredseconds.api.domain.exception.UsernameAlreadyInUseException;
import com.hundredseconds.api.domain.model.User;
import com.hundredseconds.api.domain.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class RegisterUserUseCaseTests {

	private static final Instant NOW = Instant.parse("2026-03-15T12:00:00Z");

	@Mock
	private UserRepository userRepository;

	@Mock
	private PasswordHasher passwordHasher;

	private RegisterUserUseCase useCase;

	@BeforeEach
	void setUp() {
		useCase = new RegisterUserUseCase(userRepository, passwordHasher, Clock.fixed(NOW, ZoneOffset.UTC));
	}

	@Test
	void shouldRegisterUserWithHashedPasswordAndNormalizedEmail() {
		UUID id = UUID.randomUUID();
		when(passwordHasher.hash("secret123")).thenReturn("hashed");
		when(userRepository.save(any())).thenAnswer(invocation -> {
			User user = invocation.getArgument(0);
			return new User(id, user.username(), user.email(), user.passwordHash(), user.createdAt());
		});

		RegisteredUserResult result = useCase.execute(new RegisterUserCommand(" Ana ", " Ana@Mail.COM ", "secret123"));

		ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
		verify(userRepository).save(captor.capture());
		assertThat(captor.getValue().passwordHash()).isEqualTo("hashed");
		assertThat(captor.getValue().createdAt()).isEqualTo(NOW);
		assertThat(result).isEqualTo(new RegisteredUserResult(id, "Ana", "ana@mail.com"));
	}

	@Test
	void shouldRejectDuplicatedEmail() {
		when(userRepository.existsByEmail("ana@mail.com")).thenReturn(true);

		assertThatThrownBy(() -> useCase.execute(new RegisterUserCommand("Ana", "ana@mail.com", "secret123")))
			.isInstanceOf(EmailAlreadyInUseException.class);
		verify(userRepository, never()).save(any());
	}

	@Test
	void shouldRejectDuplicatedUsername() {
		when(userRepository.existsByUsername("Ana")).thenReturn(true);

		assertThatThrownBy(() -> useCase.execute(new RegisterUserCommand("Ana", "ana@mail.com", "secret123")))
			.isInstanceOf(UsernameAlreadyInUseException.class);
		verify(userRepository, never()).save(any());
	}

	@Test
	void shouldRejectShortPassword() {
		assertThatThrownBy(() -> useCase.execute(new RegisterUserCommand("Ana", "ana@mail.com", "12345")))
			.isInstanceOf(InvalidPasswordException.class);
	}

	@Test
	void shouldRejectInvalidEmail() {
		assertThatThrownBy(() -> useCase.execute(new RegisterUserCommand("Ana", "not-an-email", "secret123")))
			.isInstanceOf(InvalidEmailException.class);
	}

	@Test
	void shouldRejectBlankUsername() {
		assertThatThrownBy(() -> useCase.execute(new RegisterUserCommand(" ", "ana@mail.com", "secret123")))
			.isInstanceOf(InvalidPlayerNameException.class);
	}

}
