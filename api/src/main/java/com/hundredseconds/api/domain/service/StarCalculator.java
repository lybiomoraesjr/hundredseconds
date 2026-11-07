package com.hundredseconds.api.domain.service;

/**
 * One star for every 10 correct answers, up to 10 stars.
 */
public final class StarCalculator {

	public static final int ANSWERS_PER_STAR = 10;
	public static final int MAX_STARS = 10;

	private StarCalculator() {
	}

	public static int starsFor(int score) {
		if (score < 0) {
			throw new IllegalArgumentException("score must not be negative");
		}
		return Math.min(MAX_STARS, score / ANSWERS_PER_STAR);
	}

}
