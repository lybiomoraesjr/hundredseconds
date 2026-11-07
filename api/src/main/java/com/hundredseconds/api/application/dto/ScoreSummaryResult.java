package com.hundredseconds.api.application.dto;

/**
 * Numbers displayed on the home screen. A null value means there is no score yet.
 */
public record ScoreSummaryResult(Integer personalBest, Integer todayBest, Integer yearBest) {
}
