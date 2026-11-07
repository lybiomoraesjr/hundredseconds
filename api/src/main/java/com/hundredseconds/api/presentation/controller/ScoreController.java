package com.hundredseconds.api.presentation.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.hundredseconds.api.application.dto.SaveScoreCommand;
import com.hundredseconds.api.application.dto.SavedScoreResult;
import com.hundredseconds.api.application.dto.ScoreSummaryResult;
import com.hundredseconds.api.application.usecase.GetLeaderboardUseCase;
import com.hundredseconds.api.application.usecase.GetScoreSummaryUseCase;
import com.hundredseconds.api.application.usecase.SaveScoreUseCase;
import com.hundredseconds.api.domain.model.GameMode;
import com.hundredseconds.api.domain.model.LeaderboardPeriod;
import com.hundredseconds.api.presentation.request.SaveScoreRequest;
import com.hundredseconds.api.presentation.response.LeaderboardEntryResponse;
import com.hundredseconds.api.presentation.response.SavedScoreResponse;
import com.hundredseconds.api.presentation.response.ScoreSummaryResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/scores")
public class ScoreController {

	private final SaveScoreUseCase saveScoreUseCase;
	private final GetScoreSummaryUseCase getScoreSummaryUseCase;
	private final GetLeaderboardUseCase getLeaderboardUseCase;

	public ScoreController(SaveScoreUseCase saveScoreUseCase, GetScoreSummaryUseCase getScoreSummaryUseCase,
			GetLeaderboardUseCase getLeaderboardUseCase) {
		this.saveScoreUseCase = saveScoreUseCase;
		this.getScoreSummaryUseCase = getScoreSummaryUseCase;
		this.getLeaderboardUseCase = getLeaderboardUseCase;
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public SavedScoreResponse save(@Valid @RequestBody SaveScoreRequest request, @AuthenticationPrincipal Jwt jwt) {
		SavedScoreResult result = saveScoreUseCase.execute(new SaveScoreCommand(CurrentUser.idOf(jwt),
				request.playerName(), request.gameMode(), request.score(), request.wrongAnswers()));
		return new SavedScoreResponse(result.id(), result.playerName(), result.gameMode(), result.score(),
				result.starsEarned(), result.wrongAnswers(), result.playedAt());
	}

	@GetMapping("/summary")
	public ScoreSummaryResponse summary(@RequestParam GameMode mode, @AuthenticationPrincipal Jwt jwt) {
		ScoreSummaryResult result = getScoreSummaryUseCase.execute(mode, CurrentUser.idOf(jwt));
		return new ScoreSummaryResponse(result.personalBest(), result.todayBest(), result.yearBest());
	}

	@GetMapping("/leaderboard")
	public List<LeaderboardEntryResponse> leaderboard(@RequestParam GameMode mode,
			@RequestParam LeaderboardPeriod period, @AuthenticationPrincipal Jwt jwt) {
		return getLeaderboardUseCase.execute(mode, period, CurrentUser.idOf(jwt))
			.stream()
			.map(entry -> new LeaderboardEntryResponse(entry.rank(), entry.playerName(), entry.score(),
					entry.playedAt()))
			.toList();
	}

}
