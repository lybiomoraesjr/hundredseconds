package com.hundredseconds.api.infrastructure.config;

import java.time.Clock;
import java.time.ZoneId;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.hundredseconds.api.application.port.PasswordHasher;
import com.hundredseconds.api.application.port.TokenIssuer;
import com.hundredseconds.api.application.usecase.GetLeaderboardUseCase;
import com.hundredseconds.api.application.usecase.GetScoreSummaryUseCase;
import com.hundredseconds.api.application.usecase.LoginUseCase;
import com.hundredseconds.api.application.usecase.RegisterUserUseCase;
import com.hundredseconds.api.application.usecase.SaveScoreUseCase;
import com.hundredseconds.api.domain.repository.GameScoreRepository;
import com.hundredseconds.api.domain.repository.UserRepository;
import com.hundredseconds.api.domain.service.LeaderboardPeriodResolver;

/**
 * Wires the framework-free use cases as Spring beans.
 */
@Configuration
public class UseCaseConfig {

	@Bean
	Clock clock() {
		return Clock.systemUTC();
	}

	@Bean
	LeaderboardPeriodResolver leaderboardPeriodResolver(Clock clock, @Value("${app.time-zone}") String timeZone) {
		return new LeaderboardPeriodResolver(clock, ZoneId.of(timeZone));
	}

	@Bean
	RegisterUserUseCase registerUserUseCase(UserRepository userRepository, PasswordHasher passwordHasher, Clock clock) {
		return new RegisterUserUseCase(userRepository, passwordHasher, clock);
	}

	@Bean
	LoginUseCase loginUseCase(UserRepository userRepository, PasswordHasher passwordHasher, TokenIssuer tokenIssuer) {
		return new LoginUseCase(userRepository, passwordHasher, tokenIssuer);
	}

	@Bean
	SaveScoreUseCase saveScoreUseCase(GameScoreRepository gameScoreRepository, UserRepository userRepository,
			Clock clock) {
		return new SaveScoreUseCase(gameScoreRepository, userRepository, clock);
	}

	@Bean
	GetScoreSummaryUseCase getScoreSummaryUseCase(GameScoreRepository gameScoreRepository,
			LeaderboardPeriodResolver leaderboardPeriodResolver) {
		return new GetScoreSummaryUseCase(gameScoreRepository, leaderboardPeriodResolver);
	}

	@Bean
	GetLeaderboardUseCase getLeaderboardUseCase(GameScoreRepository gameScoreRepository,
			LeaderboardPeriodResolver leaderboardPeriodResolver) {
		return new GetLeaderboardUseCase(gameScoreRepository, leaderboardPeriodResolver);
	}

}
