package com.hundredseconds.api.domain.service;

import com.hundredseconds.api.domain.exception.ImplausibleScoreException;
import com.hundredseconds.api.domain.model.GameMode;

/**
 * Basic anti-fraud rule: rejects results a human cannot reach.
 */
public final class ScorePlausibilityPolicy {

	public static final int MAX_SCORE = 300;
	public static final int MAX_WRONG_ANSWERS = 300;
	/** A time trial longer than one hour is not a real match. */
	public static final int MAX_DURATION_MS = 3_600_000;

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

	/**
	 * Time trials must inform how long the match took; the 100 second games must not.
	 */
	public static void validate(GameMode gameMode, int score, int wrongAnswers, Integer durationMs) {
		validate(score, wrongAnswers);
		if (!gameMode.isTimeTrial()) {
			if (durationMs != null) {
				throw new ImplausibleScoreException("Duration is only accepted for time trials");
			}
			return;
		}
		if (durationMs == null) {
			throw new ImplausibleScoreException("Time trials must inform the duration");
		}
		if (durationMs <= 0 || durationMs > MAX_DURATION_MS) {
			throw new ImplausibleScoreException("Duration must be between 1 ms and " + MAX_DURATION_MS + " ms");
		}
	}

}
