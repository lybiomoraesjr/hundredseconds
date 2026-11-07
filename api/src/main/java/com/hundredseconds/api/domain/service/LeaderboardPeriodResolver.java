package com.hundredseconds.api.domain.service;

import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;

import com.hundredseconds.api.domain.model.LeaderboardPeriod;
import com.hundredseconds.api.domain.model.TimeRange;

/**
 * Translates a leaderboard period into a concrete time range in the game's time zone.
 */
public class LeaderboardPeriodResolver {

	private static final int WEEK_DAYS = 7;

	private final Clock clock;
	private final ZoneId zoneId;

	public LeaderboardPeriodResolver(Clock clock, ZoneId zoneId) {
		this.clock = clock;
		this.zoneId = zoneId;
	}

	/**
	 * @throws IllegalArgumentException for {@link LeaderboardPeriod#USER}, which is not time based
	 */
	public TimeRange resolve(LeaderboardPeriod period) {
		ZonedDateTime now = ZonedDateTime.now(clock.withZone(zoneId));
		LocalDate today = now.toLocalDate();
		LocalDate startDate = switch (period) {
			case DAY -> today;
			case WEEK -> today.minusDays(WEEK_DAYS - 1L);
			case YEAR -> today.withDayOfYear(1);
			case USER -> throw new IllegalArgumentException("USER period has no time range");
		};
		// End is exclusive, so add a tiny margin to include the current instant
		return new TimeRange(startDate.atStartOfDay(zoneId).toInstant(), now.toInstant().plusMillis(1));
	}

}
