package com.hundredseconds.api.application.usecase;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.hundredseconds.api.application.dto.SaveScoreCommand;
import com.hundredseconds.api.application.dto.SavedScoreResult;
import com.hundredseconds.api.domain.exception.ImplausibleScoreException;
import com.hundredseconds.api.domain.exception.InvalidPlayerNameException;
import com.hundredseconds.api.domain.exception.UserNotFoundException;
import com.hundredseconds.api.domain.model.GameMode;
import com.hundredseconds.api.domain.model.GameScore;
import com.hundredseconds.api.domain.model.User;
import com.hundredseconds.api.domain.repository.GameScoreRepository;
import com.hundredseconds.api.domain.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class SaveScoreUseCaseTests {

	private static final Instant NOW = Instant.parse("2026-03-15T12:00:00Z");

	@Mock
	private GameScoreRepository gameScoreRepository;

	@Mock
	private UserRepository userRepository;

	private SaveScoreUseCase useCase;

	@BeforeEach
	void setUp() {
		useCase = new SaveScoreUseCase(gameScoreRepository, userRepository, Clock.fixed(NOW, ZoneOffset.UTC));
	}

	private void returnSavedScoreWithId(long id) {
		when(gameScoreRepository.save(any())).thenAnswer(invocation -> {
			GameScore s = invocation.getArgument(0);
			return new GameScore(id, s.userId(), s.playerName(), s.gameMode(), s.score(), s.starsEarned(),
					s.wrongAnswers(), s.playedAt());
		});
	}

	@Test
	void shouldSaveAuthenticatedScoreUsingUsernameAndIgnoringGuestName() {
		UUID userId = UUID.randomUUID();
		when(userRepository.findById(userId))
			.thenReturn(Optional.of(new User(userId, "Ana", "ana@mail.com", "hashed", NOW)));
		returnSavedScoreWithId(1L);

		SavedScoreResult result = useCase
			.execute(new SaveScoreCommand(userId, "Someone else", GameMode.EXPONENTIATION, 105, 7));

		ArgumentCaptor<GameScore> captor = ArgumentCaptor.forClass(GameScore.class);
		verify(gameScoreRepository).save(captor.capture());
		assertThat(captor.getValue().userId()).isEqualTo(userId);
		assertThat(result).isEqualTo(new SavedScoreResult(1L, "Ana", GameMode.EXPONENTIATION, 105, 10, 7, NOW));
	}

	@Test
	void shouldSaveGuestScoreWithInformedName() {
		returnSavedScoreWithId(2L);

		SavedScoreResult result = useCase
			.execute(new SaveScoreCommand(null, " Visitante ", GameMode.ROOT_EXTRACTION, 23, 4));

		verifyNoInteractions(userRepository);
		assertThat(result.playerName()).isEqualTo("Visitante");
		assertThat(result.starsEarned()).isEqualTo(2);
		assertThat(result.wrongAnswers()).isEqualTo(4);
	}

	@Test
	void shouldRejectGuestWithoutName() {
		assertThatThrownBy(() -> useCase.execute(new SaveScoreCommand(null, null, GameMode.EXPONENTIATION, 10, 0)))
			.isInstanceOf(InvalidPlayerNameException.class);
		verify(gameScoreRepository, never()).save(any());
	}

	@Test
	void shouldRejectUnknownUser() {
		UUID userId = UUID.randomUUID();
		when(userRepository.findById(userId)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> useCase.execute(new SaveScoreCommand(userId, null, GameMode.EXPONENTIATION, 10, 0)))
			.isInstanceOf(UserNotFoundException.class);
	}

	@Test
	void shouldRejectImplausibleScore() {
		assertThatThrownBy(() -> useCase.execute(new SaveScoreCommand(null, "Bot", GameMode.EXPONENTIATION, 500, 0)))
			.isInstanceOf(ImplausibleScoreException.class);
		verify(gameScoreRepository, never()).save(any());
	}

}
