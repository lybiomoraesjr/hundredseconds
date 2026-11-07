import type { GameMode, LeaderboardPeriod } from '../../domain'

/** Null values mean there is no score yet. */
export interface ScoreSummary {
  readonly personalBest: number | null
  readonly todayBest: number | null
  readonly yearBest: number | null
}

export interface LeaderboardEntry {
  readonly rank: number
  readonly playerName: string
  readonly score: number
  /** ISO-8601 date time */
  readonly playedAt: string
}

export interface FinishedMatch {
  readonly mode: GameMode
  readonly score: number
  readonly wrongAnswers: number
}

/** Where scores are read from and saved to (browser storage or the API). */
export interface ScoreGateway {
  getSummary(mode: GameMode): Promise<ScoreSummary>
  getLeaderboard(mode: GameMode, period: LeaderboardPeriod): Promise<LeaderboardEntry[]>
  saveScore(match: FinishedMatch): Promise<void>
}
