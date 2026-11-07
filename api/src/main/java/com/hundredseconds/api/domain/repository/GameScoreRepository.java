package com.hundredseconds.api.domain.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.hundredseconds.api.domain.model.GameMode;
import com.hundredseconds.api.domain.model.GameScore;
import com.hundredseconds.api.domain.model.LeaderboardEntry;
import com.hundredseconds.api.domain.model.TimeRange;

public interface GameScoreRepository {

	GameScore save(GameScore gameScore);

	Optional<Integer> findBestScore(GameMode gameMode, TimeRange range);

	Optional<Integer> findBestScoreByUser(UUID userId, GameMode gameMode);

	/** Highest scores in the range, ordered by score desc then playedAt asc. */
	List<LeaderboardEntry> findTopScores(GameMode gameMode, TimeRange range, int limit);

	/** Highest scores of the user, ordered by score desc then playedAt asc. */
	List<LeaderboardEntry> findTopScoresByUser(UUID userId, GameMode gameMode, int limit);

}
