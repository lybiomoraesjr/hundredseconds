package com.hundredseconds.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

/**
 * Verifies that the Flyway migrations create the expected schema.
 */
@IntegrationTest
@Transactional
class DatabaseMigrationTests {

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@Test
	void shouldCreateUsersAndGameScoresTables() {
		List<String> tables = jdbcTemplate.queryForList(
				"SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'", String.class);

		assertThat(tables).contains("users", "game_scores");
	}

	@Test
	void shouldCreateLeaderboardIndex() {
		Integer count = jdbcTemplate.queryForObject(
				"SELECT COUNT(*) FROM pg_indexes WHERE indexname = 'idx_scores_mode_date'", Integer.class);

		assertThat(count).isEqualTo(1);
	}

	@Test
	void shouldAcceptGuestScoreWithValidGameMode() {
		int inserted = jdbcTemplate.update(
				"INSERT INTO game_scores (player_name, game_mode, score, stars_earned) VALUES (?, ?, ?, ?)",
				"guest", "EXPONENTIATION", 42, 4);

		assertThat(inserted).isEqualTo(1);
	}

	@Test
	void shouldRejectUnknownGameMode() {
		assertThatThrownBy(() -> jdbcTemplate.update(
				"INSERT INTO game_scores (player_name, game_mode, score, stars_earned) VALUES (?, ?, ?, ?)",
				"guest", "MULTIPLICATION", 10, 1))
			.isInstanceOf(DataIntegrityViolationException.class);
	}

	@Test
	void shouldRejectMoreThanTenStars() {
		assertThatThrownBy(() -> jdbcTemplate.update(
				"INSERT INTO game_scores (player_name, game_mode, score, stars_earned) VALUES (?, ?, ?, ?)",
				"guest", "ROOT_EXTRACTION", 150, 11))
			.isInstanceOf(DataIntegrityViolationException.class);
	}

	@Test
	void shouldDefaultWrongAnswersToZero() {
		jdbcTemplate.update("INSERT INTO game_scores (player_name, game_mode, score, stars_earned) VALUES (?, ?, ?, ?)",
				"guest", "EXPONENTIATION", 5, 0);

		Integer wrongAnswers = jdbcTemplate
			.queryForObject("SELECT wrong_answers FROM game_scores WHERE player_name = 'guest'", Integer.class);

		assertThat(wrongAnswers).isZero();
	}

	@Test
	void shouldRejectNegativeWrongAnswers() {
		assertThatThrownBy(() -> jdbcTemplate.update(
				"INSERT INTO game_scores (player_name, game_mode, score, stars_earned, wrong_answers) VALUES (?, ?, ?, ?, ?)",
				"guest", "EXPONENTIATION", 5, 0, -1))
			.isInstanceOf(DataIntegrityViolationException.class);
	}

}
