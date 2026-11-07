package com.hundredseconds.api.application.usecase;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.hundredseconds.api.application.dto.LeaderboardEntryResult;
import com.hundredseconds.api.domain.exception.AuthenticationRequiredException;
import com.hundredseconds.api.domain.model.GameMode;
import com.hundredseconds.api.domain.model.LeaderboardEntry;
import com.hundredseconds.api.domain.model.LeaderboardPeriod;
import com.hundredseconds.api.domain.repository.GameScoreRepository;
import com.hundredseconds.api.domain.service.LeaderboardPeriodResolver;

@ExtendWith(MockitoExtension.class)
class GetLeaderboardUseCaseTests {

	private static final Instant PLAYED_AT = Instant.parse("2026-03-15T10:00:00Z");

	private final LeaderboardPeriodResolver resolver = new LeaderboardPeriodResolver(
			Clock.fixed(Instant.parse("2026-03-15T12:00:00Z"), ZoneId.of("UTC")), ZoneId.of("America/Sao_Paulo"));

	@Mock
	private GameScoreRepository gameScoreRepository;

	private GetLeaderboardUseCase useCase;

	@BeforeEach
	void setUp() {
		useCase = new GetLeaderboardUseCase(gameScoreRepository, resolver);
	}

	@ParameterizedTest
	@EnumSource(value = LeaderboardPeriod.class, names = { "DAY", "WEEK", "YEAR" })
	void shouldRankGlobalEntriesForTimeBasedPeriods(LeaderboardPeriod period) {
		when(gameScoreRepository.findTopScores(GameMode.EXPONENTIATION, resolver.resolve(period), 10))
			.thenReturn(List.of(new LeaderboardEntry("Ana", 118, PLAYED_AT), new LeaderboardEntry("Bia", 90, PLAYED_AT)));

		List<LeaderboardEntryResult> result = useCase.execute(GameMode.EXPONENTIATION, period, null);

		assertThat(result).containsExactly(new LeaderboardEntryResult(1, "Ana", 118, PLAYED_AT),
				new LeaderboardEntryResult(2, "Bia", 90, PLAYED_AT));
	}

	@Test
	void shouldReturnOwnResultsForUserPeriod() {
		UUID userId = UUID.randomUUID();
		when(gameScoreRepository.findTopScoresByUser(userId, GameMode.ROOT_EXTRACTION, 10))
			.thenReturn(List.of(new LeaderboardEntry("Ana", 50, PLAYED_AT)));

		List<LeaderboardEntryResult> result = useCase.execute(GameMode.ROOT_EXTRACTION, LeaderboardPeriod.USER,
				userId);

		assertThat(result).containsExactly(new LeaderboardEntryResult(1, "Ana", 50, PLAYED_AT));
	}

	@Test
	void shouldRequireAuthenticationForUserPeriod() {
		assertThatThrownBy(() -> useCase.execute(GameMode.EXPONENTIATION, LeaderboardPeriod.USER, null))
			.isInstanceOf(AuthenticationRequiredException.class);
		verifyNoInteractions(gameScoreRepository);
	}

	@Test
	void shouldReturnEmptyListWhenThereAreNoScores() {
		when(gameScoreRepository.findTopScores(GameMode.EXPONENTIATION, resolver.resolve(LeaderboardPeriod.DAY), 10))
			.thenReturn(List.of());

		assertThat(useCase.execute(GameMode.EXPONENTIATION, LeaderboardPeriod.DAY, null)).isEmpty();
	}

}
