package com.hundredseconds.api.application.usecase;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.hundredseconds.api.application.dto.ScoreSummaryResult;
import com.hundredseconds.api.domain.model.GameMode;
import com.hundredseconds.api.domain.model.LeaderboardPeriod;
import com.hundredseconds.api.domain.model.TimeRange;
import com.hundredseconds.api.domain.repository.GameScoreRepository;
import com.hundredseconds.api.domain.service.LeaderboardPeriodResolver;

@ExtendWith(MockitoExtension.class)
class GetScoreSummaryUseCaseTests {

	private final LeaderboardPeriodResolver resolver = new LeaderboardPeriodResolver(
			Clock.fixed(Instant.parse("2026-03-15T12:00:00Z"), ZoneId.of("UTC")), ZoneId.of("America/Sao_Paulo"));

	@Mock
	private GameScoreRepository gameScoreRepository;

	private GetScoreSummaryUseCase useCase;

	private TimeRange today;

	private TimeRange year;

	@BeforeEach
	void setUp() {
		useCase = new GetScoreSummaryUseCase(gameScoreRepository, resolver);
		today = resolver.resolve(LeaderboardPeriod.DAY);
		year = resolver.resolve(LeaderboardPeriod.YEAR);
	}

	@Test
	void shouldReturnPersonalTodayAndYearBestForAuthenticatedUser() {
		UUID userId = UUID.randomUUID();
		when(gameScoreRepository.findBestScoreByUser(userId, GameMode.EXPONENTIATION)).thenReturn(Optional.of(80));
		when(gameScoreRepository.findBestScore(GameMode.EXPONENTIATION, today)).thenReturn(Optional.of(95));
		when(gameScoreRepository.findBestScore(GameMode.EXPONENTIATION, year)).thenReturn(Optional.of(118));

		ScoreSummaryResult result = useCase.execute(GameMode.EXPONENTIATION, userId);

		assertThat(result).isEqualTo(new ScoreSummaryResult(80, 95, 118));
	}

	@Test
	void shouldNotQueryPersonalBestForGuests() {
		when(gameScoreRepository.findBestScore(eq(GameMode.ROOT_EXTRACTION), any())).thenReturn(Optional.of(40));

		ScoreSummaryResult result = useCase.execute(GameMode.ROOT_EXTRACTION, null);

		assertThat(result).isEqualTo(new ScoreSummaryResult(null, 40, 40));
		verify(gameScoreRepository, never()).findBestScoreByUser(any(), any());
	}

	@Test
	void shouldReturnNullsWhenThereAreNoScores() {
		when(gameScoreRepository.findBestScore(eq(GameMode.EXPONENTIATION), any())).thenReturn(Optional.empty());
		when(gameScoreRepository.findBestScoreByUser(any(), any())).thenReturn(Optional.empty());

		assertThat(useCase.execute(GameMode.EXPONENTIATION, UUID.randomUUID()))
			.isEqualTo(new ScoreSummaryResult(null, null, null));
	}

}
