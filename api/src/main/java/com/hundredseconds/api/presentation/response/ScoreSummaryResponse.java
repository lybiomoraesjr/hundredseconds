package com.hundredseconds.api.presentation.response;

/**
 * Null values mean there is no score yet.
 */
public record ScoreSummaryResponse(Integer personalBest, Integer todayBest, Integer yearBest) {
}
