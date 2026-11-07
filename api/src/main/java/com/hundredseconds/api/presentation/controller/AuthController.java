package com.hundredseconds.api.presentation.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.hundredseconds.api.application.dto.AuthenticationResult;
import com.hundredseconds.api.application.dto.LoginCommand;
import com.hundredseconds.api.application.dto.RegisterUserCommand;
import com.hundredseconds.api.application.dto.RegisteredUserResult;
import com.hundredseconds.api.application.usecase.LoginUseCase;
import com.hundredseconds.api.application.usecase.RegisterUserUseCase;
import com.hundredseconds.api.presentation.request.LoginRequest;
import com.hundredseconds.api.presentation.request.RegisterRequest;
import com.hundredseconds.api.presentation.response.AuthenticationResponse;
import com.hundredseconds.api.presentation.response.RegisteredUserResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private static final String TOKEN_TYPE = "Bearer";

	private final RegisterUserUseCase registerUserUseCase;
	private final LoginUseCase loginUseCase;

	public AuthController(RegisterUserUseCase registerUserUseCase, LoginUseCase loginUseCase) {
		this.registerUserUseCase = registerUserUseCase;
		this.loginUseCase = loginUseCase;
	}

	@PostMapping("/register")
	@ResponseStatus(HttpStatus.CREATED)
	public RegisteredUserResponse register(@Valid @RequestBody RegisterRequest request) {
		RegisteredUserResult result = registerUserUseCase
			.execute(new RegisterUserCommand(request.username(), request.email(), request.password()));
		return new RegisteredUserResponse(result.id(), result.username(), result.email());
	}

	@PostMapping("/login")
	public AuthenticationResponse login(@Valid @RequestBody LoginRequest request) {
		AuthenticationResult result = loginUseCase.execute(new LoginCommand(request.email(), request.password()));
		return new AuthenticationResponse(result.accessToken(), TOKEN_TYPE, result.userId(), result.username());
	}

}
