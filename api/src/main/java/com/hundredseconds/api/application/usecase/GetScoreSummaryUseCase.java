package com.hundredseconds.api.application.usecase;

import java.util.UUID;

import com.hundredseconds.api.application.dto.ScoreSummaryResult;
import com.hundredseconds.api.domain.model.GameMode;
import com.hundredseconds.api.domain.model.LeaderboardPeriod;
import com.hundredseconds.api.domain.repository.GameScoreRepository;
import com.hundredseconds.api.domain.service.LeaderboardPeriodResolver;

public class GetScoreSummaryUseCase {

	private final GameScoreRepository gameScoreRepository;
	private final LeaderboardPeriodResolver periodResolver;

	public GetScoreSummaryUseCase(GameScoreRepository gameScoreRepository, LeaderboardPeriodResolver periodResolver) {
		this.gameScoreRepository = gameScoreRepository;
		this.periodResolver = periodResolver;
	}

	/**
	 * @param userId null for guests; personal best then comes from the browser storage
	 */
	public ScoreSummaryResult execute(GameMode gameMode, UUID userId) {
		Integer personalBest = userId == null ? null
				: gameScoreRepository.findBestScoreByUser(userId, gameMode).orElse(null);
		Integer todayBest = gameScoreRepository
			.findBestScore(gameMode, periodResolver.resolve(LeaderboardPeriod.DAY))
			.orElse(null);
		Integer yearBest = gameScoreRepository
			.findBestScore(gameMode, periodResolver.resolve(LeaderboardPeriod.YEAR))
			.orElse(null);
		return new ScoreSummaryResult(personalBest, todayBest, yearBest);
	}

}
