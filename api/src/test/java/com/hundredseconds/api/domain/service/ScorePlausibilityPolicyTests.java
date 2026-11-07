package com.hundredseconds.api.domain.service;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import com.hundredseconds.api.domain.exception.ImplausibleScoreException;

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

}
