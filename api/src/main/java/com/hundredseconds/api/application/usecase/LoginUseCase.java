package com.hundredseconds.api.application.usecase;

import java.util.Locale;

import com.hundredseconds.api.application.dto.AuthenticationResult;
import com.hundredseconds.api.application.dto.LoginCommand;
import com.hundredseconds.api.application.port.PasswordHasher;
import com.hundredseconds.api.application.port.TokenIssuer;
import com.hundredseconds.api.domain.exception.InvalidCredentialsException;
import com.hundredseconds.api.domain.model.User;
import com.hundredseconds.api.domain.repository.UserRepository;

public class LoginUseCase {

	private final UserRepository userRepository;
	private final PasswordHasher passwordHasher;
	private final TokenIssuer tokenIssuer;

	public LoginUseCase(UserRepository userRepository, PasswordHasher passwordHasher, TokenIssuer tokenIssuer) {
		this.userRepository = userRepository;
		this.passwordHasher = passwordHasher;
		this.tokenIssuer = tokenIssuer;
	}

	public AuthenticationResult execute(LoginCommand command) {
		if (command.email() == null || command.password() == null) {
			throw invalidCredentials();
		}
		String email = command.email().strip().toLowerCase(Locale.ROOT);

		// Same error for unknown e-mail and wrong password, to avoid account enumeration
		User user = userRepository.findByEmail(email).orElseThrow(LoginUseCase::invalidCredentials);
		if (!passwordHasher.matches(command.password(), user.passwordHash())) {
			throw invalidCredentials();
		}
		return new AuthenticationResult(tokenIssuer.issue(user), user.id(), user.username());
	}

	private static InvalidCredentialsException invalidCredentials() {
		return new InvalidCredentialsException("Invalid e-mail or password");
	}

}
