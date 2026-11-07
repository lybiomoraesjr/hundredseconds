package com.hundredseconds.api.infrastructure.persistence;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import com.hundredseconds.api.IntegrationTest;
import com.hundredseconds.api.domain.model.GameMode;
import com.hundredseconds.api.domain.model.GameScore;
import com.hundredseconds.api.domain.model.LeaderboardEntry;
import com.hundredseconds.api.domain.model.PlayerName;
import com.hundredseconds.api.domain.model.TimeRange;
import com.hundredseconds.api.domain.model.User;
import com.hundredseconds.api.domain.repository.GameScoreRepository;
import com.hundredseconds.api.domain.repository.UserRepository;

@IntegrationTest
@Transactional
class GameScoreRepositoryAdapterTests {

	private static final Instant MARCH_10 = Instant.parse("2026-03-10T12:00:00Z");
	private static final Instant MARCH_15 = Instant.parse("2026-03-15T12:00:00Z");
	private static final TimeRange MARCH_14_TO_16 = new TimeRange(Instant.parse("2026-03-14T00:00:00Z"),
			Instant.parse("2026-03-16T00:00:00Z"));

	@Autowired
	private GameScoreRepository gameScoreRepository;

	@Autowired
	private UserRepository userRepository;

	private UUID anaId;

	@BeforeEach
	void setUp() {
		anaId = userRepository.save(User.newUser("Ana", "ana@mail.com", "hashed", MARCH_10)).id();
	}

	private void save(UUID userId, String name, GameMode mode, int score, Instant playedAt) {
		gameScoreRepository.save(GameScore.create(userId, new PlayerName(name), mode, score, 0, playedAt));
	}

	@Test
	void shouldPersistAllFields() {
		GameScore saved = gameScoreRepository
			.save(GameScore.create(anaId, new PlayerName("Ana"), GameMode.EXPONENTIATION, 57, 3, MARCH_15));

		assertThat(saved.id()).isNotNull();
		assertThat(saved).extracting(GameScore::userId, GameScore::score, GameScore::starsEarned,
				GameScore::wrongAnswers, GameScore::playedAt)
			.containsExactly(anaId, 57, 5, 3, MARCH_15);
	}

	@Test
	void bestScoreShouldOnlyConsiderModeAndRange() {
		save(null, "Bia", GameMode.EXPONENTIATION, 40, MARCH_15);
		save(null, "Caio", GameMode.EXPONENTIATION, 99, MARCH_10); // outside range
		save(null, "Davi", GameMode.ROOT_EXTRACTION, 80, MARCH_15); // other mode

		assertThat(gameScoreRepository.findBestScore(GameMode.EXPONENTIATION, MARCH_14_TO_16)).contains(40);
		assertThat(gameScoreRepository.findBestScore(GameMode.EXPONENTIATION,
				new TimeRange(Instant.parse("2027-01-01T00:00:00Z"), Instant.parse("2027-01-02T00:00:00Z"))))
			.isEmpty();
	}

	@Test
	void bestScoreByUserShouldIgnoreOtherPlayers() {
		save(anaId, "Ana", GameMode.EXPONENTIATION, 30, MARCH_10);
		save(anaId, "Ana", GameMode.EXPONENTIATION, 45, MARCH_15);
		save(null, "Bia", GameMode.EXPONENTIATION, 99, MARCH_15);

		assertThat(gameScoreRepository.findBestScoreByUser(anaId, GameMode.EXPONENTIATION)).contains(45);
		assertThat(gameScoreRepository.findBestScoreByUser(anaId, GameMode.ROOT_EXTRACTION)).isEmpty();
	}

	@Test
	void topScoresShouldBeOrderedByScoreThenEarliestAndLimited() {
		save(null, "Late", GameMode.EXPONENTIATION, 50, MARCH_15.plusSeconds(60));
		save(null, "Early", GameMode.EXPONENTIATION, 50, MARCH_15);
		save(null, "Best", GameMode.EXPONENTIATION, 70, MARCH_15);
		save(null, "Low", GameMode.EXPONENTIATION, 10, MARCH_15);

		List<LeaderboardEntry> top = gameScoreRepository.findTopScores(GameMode.EXPONENTIATION, MARCH_14_TO_16, 3);

		assertThat(top).extracting(LeaderboardEntry::playerName).containsExactly("Best", "Early", "Late");
	}

	@Test
	void topScoresByUserShouldReturnOnlyThatUser() {
		save(anaId, "Ana", GameMode.ROOT_EXTRACTION, 20, MARCH_10);
		save(anaId, "Ana", GameMode.ROOT_EXTRACTION, 35, MARCH_15);
		save(null, "Bia", GameMode.ROOT_EXTRACTION, 90, MARCH_15);

		List<LeaderboardEntry> top = gameScoreRepository.findTopScoresByUser(anaId, GameMode.ROOT_EXTRACTION, 10);

		assertThat(top).extracting(LeaderboardEntry::score).containsExactly(35, 20);
	}

}
