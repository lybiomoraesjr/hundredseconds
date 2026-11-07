package com.hundredseconds.api.domain.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;

import org.junit.jupiter.api.Test;

import com.hundredseconds.api.domain.model.LeaderboardPeriod;
import com.hundredseconds.api.domain.model.TimeRange;

class LeaderboardPeriodResolverTests {

	private static final ZoneId SAO_PAULO = ZoneId.of("America/Sao_Paulo");

	// 2026-03-15 01:30 in Sao Paulo (UTC-3) is still 2026-03-15 04:30 UTC
	private static final Instant NOW = Instant.parse("2026-03-15T04:30:00Z");

	private final LeaderboardPeriodResolver resolver = new LeaderboardPeriodResolver(
			Clock.fixed(NOW, ZoneId.of("UTC")), SAO_PAULO);

	@Test
	void dayShouldStartAtLocalMidnight() {
		TimeRange range = resolver.resolve(LeaderboardPeriod.DAY);

		assertThat(range.start()).isEqualTo(Instant.parse("2026-03-15T03:00:00Z"));
		assertThat(range.end()).isAfter(NOW);
	}

	@Test
	void dayShouldUseGameTimeZoneInsteadOfUtc() {
		// 02:00 UTC on the 16th is still the 15th in Sao Paulo
		LeaderboardPeriodResolver lateNight = new LeaderboardPeriodResolver(
				Clock.fixed(Instant.parse("2026-03-16T02:00:00Z"), ZoneId.of("UTC")), SAO_PAULO);

		assertThat(lateNight.resolve(LeaderboardPeriod.DAY).start()).isEqualTo(Instant.parse("2026-03-15T03:00:00Z"));
	}

	@Test
	void weekShouldCoverTheLastSevenDaysIncludingToday() {
		TimeRange range = resolver.resolve(LeaderboardPeriod.WEEK);

		assertThat(range.start()).isEqualTo(Instant.parse("2026-03-09T03:00:00Z"));
	}

	@Test
	void yearShouldStartOnJanuaryFirst() {
		TimeRange range = resolver.resolve(LeaderboardPeriod.YEAR);

		assertThat(range.start()).isEqualTo(Instant.parse("2026-01-01T03:00:00Z"));
	}

	@Test
	void userPeriodHasNoTimeRange() {
		assertThatThrownBy(() -> resolver.resolve(LeaderboardPeriod.USER))
			.isInstanceOf(IllegalArgumentException.class);
	}

}
