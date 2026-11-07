package com.hundredseconds.api.domain.model;

/**
 * Tabs available on the highscores screen.
 */
public enum LeaderboardPeriod {
	/** Best results of the authenticated player. */
	USER,
	/** Global results since today at 00:00. */
	DAY,
	/** Global results of the last 7 days (today included). */
	WEEK,
	/** Global results since January 1st of the current year. */
	YEAR
}
