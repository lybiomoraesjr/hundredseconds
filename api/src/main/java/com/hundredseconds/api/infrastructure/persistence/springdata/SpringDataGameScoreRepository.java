package com.hundredseconds.api.infrastructure.persistence.springdata;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.hundredseconds.api.domain.model.GameMode;
import com.hundredseconds.api.infrastructure.persistence.entity.GameScoreJpaEntity;

public interface SpringDataGameScoreRepository extends JpaRepository<GameScoreJpaEntity, Long> {

	@Query("""
			SELECT MAX(s.score) FROM GameScoreJpaEntity s
			WHERE s.gameMode = :gameMode AND s.playedAt >= :start AND s.playedAt < :end
			""")
	Integer findMaxScore(@Param("gameMode") GameMode gameMode, @Param("start") Instant start,
			@Param("end") Instant end);

	@Query("""
			SELECT MAX(s.score) FROM GameScoreJpaEntity s
			WHERE s.userId = :userId AND s.gameMode = :gameMode
			""")
	Integer findMaxScoreByUser(@Param("userId") UUID userId, @Param("gameMode") GameMode gameMode);

	@Query("""
			SELECT s FROM GameScoreJpaEntity s
			WHERE s.gameMode = :gameMode AND s.playedAt >= :start AND s.playedAt < :end
			ORDER BY s.score DESC, s.playedAt ASC
			""")
	List<GameScoreJpaEntity> findTopScores(@Param("gameMode") GameMode gameMode, @Param("start") Instant start,
			@Param("end") Instant end, Pageable pageable);

	@Query("""
			SELECT s FROM GameScoreJpaEntity s
			WHERE s.userId = :userId AND s.gameMode = :gameMode
			ORDER BY s.score DESC, s.playedAt ASC
			""")
	List<GameScoreJpaEntity> findTopScoresByUser(@Param("userId") UUID userId, @Param("gameMode") GameMode gameMode,
			Pageable pageable);

}
