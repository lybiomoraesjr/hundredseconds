package com.hundredseconds.api.domain.model;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Instant;
import java.util.UUID;

import org.junit.jupiter.api.Test;

import com.hundredseconds.api.domain.exception.ImplausibleScoreException;

class GameScoreTests {

	private static final Instant PLAYED_AT = Instant.parse("2026-03-15T12:00:00Z");

	@Test
	void shouldDeriveStarsFromScore() {
		GameScore score = GameScore.create(UUID.randomUUID(), new PlayerName("Ana"), GameMode.EXPONENTIATION, 57, 3,
				PLAYED_AT);

		assertThat(score.starsEarned()).isEqualTo(5);
		assertThat(score.wrongAnswers()).isEqualTo(3);
		assertThat(score.isGuest()).isFalse();
	}

	@Test
	void shouldIdentifyGuestScore() {
		GameScore score = GameScore.create(null, new PlayerName("Visitante"), GameMode.ROOT_EXTRACTION, 10, 0,
				PLAYED_AT);

		assertThat(score.isGuest()).isTrue();
	}

	@Test
	void shouldRejectImplausibleScore() {
		assertThatThrownBy(
				() -> GameScore.create(null, new PlayerName("Bot"), GameMode.EXPONENTIATION, 301, 0, PLAYED_AT))
			.isInstanceOf(ImplausibleScoreException.class);
	}

}
