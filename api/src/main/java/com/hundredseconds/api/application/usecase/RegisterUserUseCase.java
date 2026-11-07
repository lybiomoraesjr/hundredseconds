package com.hundredseconds.api.application.usecase;

import java.time.Clock;
import java.util.Locale;
import java.util.regex.Pattern;

import com.hundredseconds.api.application.dto.RegisterUserCommand;
import com.hundredseconds.api.application.dto.RegisteredUserResult;
import com.hundredseconds.api.application.port.PasswordHasher;
import com.hundredseconds.api.domain.exception.EmailAlreadyInUseException;
import com.hundredseconds.api.domain.exception.InvalidEmailException;
import com.hundredseconds.api.domain.exception.InvalidPasswordException;
import com.hundredseconds.api.domain.exception.UsernameAlreadyInUseException;
import com.hundredseconds.api.domain.model.PlayerName;
import com.hundredseconds.api.domain.model.User;
import com.hundredseconds.api.domain.repository.UserRepository;

public class RegisterUserUseCase {

	public static final int MIN_PASSWORD_LENGTH = 6;
	private static final Pattern EMAIL_PATTERN = Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");

	private final UserRepository userRepository;
	private final PasswordHasher passwordHasher;
	private final Clock clock;

	public RegisterUserUseCase(UserRepository userRepository, PasswordHasher passwordHasher, Clock clock) {
		this.userRepository = userRepository;
		this.passwordHasher = passwordHasher;
		this.clock = clock;
	}

	public RegisteredUserResult execute(RegisterUserCommand command) {
		// Username follows the same rules as the leaderboard name
		String username = new PlayerName(command.username()).value();
		String email = normalizeEmail(command.email());
		validatePassword(command.password());

		if (userRepository.existsByEmail(email)) {
			throw new EmailAlreadyInUseException("E-mail is already in use");
		}
		if (userRepository.existsByUsername(username)) {
			throw new UsernameAlreadyInUseException("Username is already in use");
		}

		User saved = userRepository
			.save(User.newUser(username, email, passwordHasher.hash(command.password()), clock.instant()));
		return new RegisteredUserResult(saved.id(), saved.username(), saved.email());
	}

	static String normalizeEmail(String email) {
		if (email == null) {
			throw new InvalidEmailException("E-mail must not be blank");
		}
		String normalized = email.strip().toLowerCase(Locale.ROOT);
		if (!EMAIL_PATTERN.matcher(normalized).matches()) {
			throw new InvalidEmailException("E-mail is invalid");
		}
		return normalized;
	}

	private static void validatePassword(String password) {
		if (password == null || password.length() < MIN_PASSWORD_LENGTH) {
			throw new InvalidPasswordException("Password must have at least " + MIN_PASSWORD_LENGTH + " characters");
		}
	}

}
