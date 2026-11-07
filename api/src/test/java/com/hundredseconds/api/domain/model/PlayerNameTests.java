package com.hundredseconds.api.domain.model;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

import com.hundredseconds.api.domain.exception.InvalidPlayerNameException;

class PlayerNameTests {

	@Test
	void shouldTrimSurroundingSpaces() {
		assertThat(new PlayerName("  Ana  ").value()).isEqualTo("Ana");
	}

	@Test
	void shouldAcceptFiftyCharacters() {
		assertThat(new PlayerName("a".repeat(50)).value()).hasSize(50);
	}

	@Test
	void shouldRejectMoreThanFiftyCharacters() {
		assertThatThrownBy(() -> new PlayerName("a".repeat(51))).isInstanceOf(InvalidPlayerNameException.class);
	}

	@ParameterizedTest
	@NullAndEmptySource
	@ValueSource(strings = { "   ", "\t" })
	void shouldRejectBlankNames(String value) {
		assertThatThrownBy(() -> new PlayerName(value)).isInstanceOf(InvalidPlayerNameException.class);
	}

}
