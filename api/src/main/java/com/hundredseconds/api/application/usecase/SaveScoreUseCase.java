package com.hundredseconds.api.application.usecase;

import java.time.Clock;
import java.util.Objects;

import com.hundredseconds.api.application.dto.SaveScoreCommand;
import com.hundredseconds.api.application.dto.SavedScoreResult;
import com.hundredseconds.api.domain.exception.UserNotFoundException;
import com.hundredseconds.api.domain.model.GameScore;
import com.hundredseconds.api.domain.model.PlayerName;
import com.hundredseconds.api.domain.repository.GameScoreRepository;
import com.hundredseconds.api.domain.repository.UserRepository;

public class SaveScoreUseCase {

	private final GameScoreRepository gameScoreRepository;
	private final UserRepository userRepository;
	private final Clock clock;

	public SaveScoreUseCase(GameScoreRepository gameScoreRepository, UserRepository userRepository, Clock clock) {
		this.gameScoreRepository = gameScoreRepository;
		this.userRepository = userRepository;
		this.clock = clock;
	}

	public SavedScoreResult execute(SaveScoreCommand command) {
		Objects.requireNonNull(command.gameMode(), "gameMode must not be null");

		// Authenticated players always appear with their username; guests must inform a name
		PlayerName playerName = command.userId() != null
				? new PlayerName(userRepository.findById(command.userId())
					.orElseThrow(() -> new UserNotFoundException("User not found"))
					.username())
				: new PlayerName(command.guestName());

		GameScore saved = gameScoreRepository.save(GameScore.create(command.userId(), playerName, command.gameMode(),
				command.score(), command.wrongAnswers(), clock.instant()));

		return new SavedScoreResult(saved.id(), saved.playerName().value(), saved.gameMode(), saved.score(),
				saved.starsEarned(), saved.wrongAnswers(), saved.playedAt());
	}

}
