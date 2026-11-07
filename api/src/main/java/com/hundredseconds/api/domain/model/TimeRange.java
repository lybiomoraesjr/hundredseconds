package com.hundredseconds.api.domain.model;

import java.time.Instant;

/**
 * Half-open interval [start, end).
 */
public record TimeRange(Instant start, Instant end) {

	public TimeRange {
		if (!start.isBefore(end)) {
			throw new IllegalArgumentException("start must be before end");
		}
	}

}
