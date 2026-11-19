package com.hundredseconds.api.domain.service;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import org.junit.jupiter.api.Test;

import com.hundredseconds.api.domain.exception.ImplausibleScoreException;
import com.hundredseconds.api.domain.model.GameMode;

class ScorePlausibilityPolicyTests {

	@ParameterizedTest(name = "score {0}, wrong {1} is accepted")
	@CsvSource({ "0,0", "105,7", "300,0", "0,300" })
	void shouldAcceptHumanlyPossibleResults(int score, int wrongAnswers) {
		assertThatCode(() -> ScorePlausibilityPolicy.validate(score, wrongAnswers)).doesNotThrowAnyException();
	}

	@ParameterizedTest(name = "score {0}, wrong {1} is rejected")
	@CsvSource({ "301,0", "0,301", "-1,0", "0,-1" })
	void shouldRejectImpossibleResults(int score, int wrongAnswers) {
		assertThatThrownBy(() -> ScorePlausibilityPolicy.validate(score, wrongAnswers))
			.isInstanceOf(ImplausibleScoreException.class);
	}

	@Test
	void timeTrialsShouldRequireAPlausibleDuration() {
		assertThatCode(() -> ScorePlausibilityPolicy.validate(GameMode.RULERS_ALL, 50, 0, 180_000))
			.doesNotThrowAnyException();
		for (Integer duration : new Integer[] { null, 0, -1, 3_600_001 }) {
			assertThatThrownBy(() -> ScorePlausibilityPolicy.validate(GameMode.RULERS_ALL, 50, 0, duration))
				.isInstanceOf(ImplausibleScoreException.class);
		}
	}

	@Test
	void hundredSecondGamesShouldNotHaveADuration() {
		assertThatCode(() -> ScorePlausibilityPolicy.validate(GameMode.STATE_FLAGS, 20, 0, null))
			.doesNotThrowAnyException();
		assertThatThrownBy(() -> ScorePlausibilityPolicy.validate(GameMode.STATE_FLAGS, 20, 0, 50_000))
			.isInstanceOf(ImplausibleScoreException.class);
	}

}
