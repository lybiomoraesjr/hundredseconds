package com.hundredseconds.api.domain.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

class StarCalculatorTests {

	@ParameterizedTest(name = "score {0} -> {1} stars")
	@CsvSource({ "0,0", "9,0", "10,1", "19,1", "25,2", "99,9", "100,10", "150,10", "300,10" })
	void shouldGiveOneStarEveryTenCorrectAnswersUpToTen(int score, int expectedStars) {
		assertThat(StarCalculator.starsFor(score)).isEqualTo(expectedStars);
	}

	@Test
	void shouldRejectNegativeScore() {
		assertThatThrownBy(() -> StarCalculator.starsFor(-1)).isInstanceOf(IllegalArgumentException.class);
	}

}
