package com.hundredseconds.api.infrastructure.persistence.entity;

import java.time.Instant;
import java.util.UUID;

import com.hundredseconds.api.domain.model.GameMode;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "game_scores")
public class GameScoreJpaEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	/** Plain column instead of a relationship: the domain only needs the id. */
	@Column(name = "user_id")
	private UUID userId;

	@Column(name = "player_name", nullable = false, length = 50)
	private String playerName;

	@Enumerated(EnumType.STRING)
	@Column(name = "game_mode", nullable = false, length = 20)
	private GameMode gameMode;

	@Column(nullable = false)
	private int score;

	@Column(name = "stars_earned", nullable = false)
	private int starsEarned;

	@Column(name = "wrong_answers", nullable = false)
	private int wrongAnswers;

	@Column(name = "played_at", nullable = false)
	private Instant playedAt;

	protected GameScoreJpaEntity() {
		// Required by JPA
	}

	public GameScoreJpaEntity(Long id, UUID userId, String playerName, GameMode gameMode, int score, int starsEarned,
			int wrongAnswers, Instant playedAt) {
		this.id = id;
		this.userId = userId;
		this.playerName = playerName;
		this.gameMode = gameMode;
		this.score = score;
		this.starsEarned = starsEarned;
		this.wrongAnswers = wrongAnswers;
		this.playedAt = playedAt;
	}

	public Long getId() {
		return id;
	}

	public UUID getUserId() {
		return userId;
	}

	public String getPlayerName() {
		return playerName;
	}

	public GameMode getGameMode() {
		return gameMode;
	}

	public int getScore() {
		return score;
	}

	public int getStarsEarned() {
		return starsEarned;
	}

	public int getWrongAnswers() {
		return wrongAnswers;
	}

	public Instant getPlayedAt() {
		return playedAt;
	}

}
