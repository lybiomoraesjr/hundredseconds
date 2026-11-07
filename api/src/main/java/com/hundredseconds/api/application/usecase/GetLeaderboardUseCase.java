package com.hundredseconds.api.application.usecase;

import java.util.List;
import java.util.UUID;
import java.util.stream.IntStream;

import com.hundredseconds.api.application.dto.LeaderboardEntryResult;
import com.hundredseconds.api.domain.exception.AuthenticationRequiredException;
import com.hundredseconds.api.domain.model.GameMode;
import com.hundredseconds.api.domain.model.LeaderboardEntry;
import com.hundredseconds.api.domain.model.LeaderboardPeriod;
import com.hundredseconds.api.domain.repository.GameScoreRepository;
import com.hundredseconds.api.domain.service.LeaderboardPeriodResolver;

public class GetLeaderboardUseCase {

	public static final int LEADERBOARD_SIZE = 10;

	private final GameScoreRepository gameScoreRepository;
	private final LeaderboardPeriodResolver periodResolver;

	public GetLeaderboardUseCase(GameScoreRepository gameScoreRepository, LeaderboardPeriodResolver periodResolver) {
		this.gameScoreRepository = gameScoreRepository;
		this.periodResolver = periodResolver;
	}

	public List<LeaderboardEntryResult> execute(GameMode gameMode, LeaderboardPeriod period, UUID userId) {
		List<LeaderboardEntry> entries;
		if (period == LeaderboardPeriod.USER) {
			if (userId == null) {
				throw new AuthenticationRequiredException("Login is required to see your own results");
			}
			entries = gameScoreRepository.findTopScoresByUser(userId, gameMode, LEADERBOARD_SIZE);
		}
		else {
			entries = gameScoreRepository.findTopScores(gameMode, periodResolver.resolve(period), LEADERBOARD_SIZE);
		}

		return IntStream.range(0, entries.size()).mapToObj(index -> {
			LeaderboardEntry entry = entries.get(index);
			return new LeaderboardEntryResult(index + 1, entry.playerName(), entry.score(), entry.playedAt());
		}).toList();
	}

}
