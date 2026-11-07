package com.hundredseconds.api.domain.service;

import com.hundredseconds.api.domain.exception.ImplausibleScoreException;

/**
 * Basic anti-fraud rule: rejects results a human cannot reach in 100 seconds.
 */
public final class ScorePlausibilityPolicy {

	public static final int MAX_SCORE = 300;
	public static final int MAX_WRONG_ANSWERS = 300;

	private ScorePlausibilityPolicy() {
	}

	public static void validate(int score, int wrongAnswers) {
		if (score < 0 || wrongAnswers < 0) {
			throw new ImplausibleScoreException("Score and wrong answers must not be negative");
		}
		if (score > MAX_SCORE) {
			throw new ImplausibleScoreException("Score above " + MAX_SCORE + " is not plausible");
		}
		if (wrongAnswers > MAX_WRONG_ANSWERS) {
			throw new ImplausibleScoreException("Wrong answers above " + MAX_WRONG_ANSWERS + " is not plausible");
		}
	}

}
