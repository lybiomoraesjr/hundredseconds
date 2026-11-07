package com.hundredseconds.api.infrastructure.persistence.adapter;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Repository;

import com.hundredseconds.api.domain.model.GameMode;
import com.hundredseconds.api.domain.model.GameScore;
import com.hundredseconds.api.domain.model.LeaderboardEntry;
import com.hundredseconds.api.domain.model.PlayerName;
import com.hundredseconds.api.domain.model.TimeRange;
import com.hundredseconds.api.domain.repository.GameScoreRepository;
import com.hundredseconds.api.infrastructure.persistence.entity.GameScoreJpaEntity;
import com.hundredseconds.api.infrastructure.persistence.springdata.SpringDataGameScoreRepository;

/**
 * Implements the domain port on top of Spring Data JPA.
 */
@Repository
public class GameScoreRepositoryAdapter implements GameScoreRepository {

	private final SpringDataGameScoreRepository repository;

	public GameScoreRepositoryAdapter(SpringDataGameScoreRepository repository) {
		this.repository = repository;
	}

	@Override
	public GameScore save(GameScore gameScore) {
		return toDomain(repository.save(toEntity(gameScore)));
	}

	@Override
	public Optional<Integer> findBestScore(GameMode gameMode, TimeRange range) {
		return Optional.ofNullable(repository.findMaxScore(gameMode, range.start(), range.end()));
	}

	@Override
	public Optional<Integer> findBestScoreByUser(UUID userId, GameMode gameMode) {
		return Optional.ofNullable(repository.findMaxScoreByUser(userId, gameMode));
	}

	@Override
	public List<LeaderboardEntry> findTopScores(GameMode gameMode, TimeRange range, int limit) {
		return repository.findTopScores(gameMode, range.start(), range.end(), PageRequest.of(0, limit))
			.stream()
			.map(GameScoreRepositoryAdapter::toEntry)
			.toList();
	}

	@Override
	public List<LeaderboardEntry> findTopScoresByUser(UUID userId, GameMode gameMode, int limit) {
		return repository.findTopScoresByUser(userId, gameMode, PageRequest.of(0, limit))
			.stream()
			.map(GameScoreRepositoryAdapter::toEntry)
			.toList();
	}

	private static GameScoreJpaEntity toEntity(GameScore score) {
		return new GameScoreJpaEntity(score.id(), score.userId(), score.playerName().value(), score.gameMode(),
				score.score(), score.starsEarned(), score.wrongAnswers(), score.playedAt());
	}

	private static GameScore toDomain(GameScoreJpaEntity entity) {
		return new GameScore(entity.getId(), entity.getUserId(), new PlayerName(entity.getPlayerName()),
				entity.getGameMode(), entity.getScore(), entity.getStarsEarned(), entity.getWrongAnswers(),
				entity.getPlayedAt());
	}

	private static LeaderboardEntry toEntry(GameScoreJpaEntity entity) {
		return new LeaderboardEntry(entity.getPlayerName(), entity.getScore(), entity.getPlayedAt());
	}

}
