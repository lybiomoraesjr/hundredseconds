import type { LeaderboardEntry, ScoreSummary } from '../../application/ports/ScoreGateway'
import type { GameMode, LeaderboardPeriod } from '../../domain'
import type { HttpClient } from './HttpClient'

export interface SaveScoreRequest {
  readonly gameMode: GameMode
  readonly score: number
  readonly wrongAnswers: number
  readonly playerName?: string
}

/** Raw calls to /api/scores (section 7 of the spec). */
export class ScoreApiClient {
  private readonly http: HttpClient

  constructor(http: HttpClient) {
    this.http = http
  }

  getSummary(mode: GameMode, token: string | null): Promise<ScoreSummary> {
    return this.http.get('/api/scores/summary', { query: { mode }, token })
  }

  getLeaderboard(mode: GameMode, period: LeaderboardPeriod, token: string | null): Promise<LeaderboardEntry[]> {
    return this.http.get('/api/scores/leaderboard', { query: { mode, period }, token })
  }

  async save(request: SaveScoreRequest, token: string | null): Promise<void> {
    await this.http.post('/api/scores', { body: request, token })
  }
}
