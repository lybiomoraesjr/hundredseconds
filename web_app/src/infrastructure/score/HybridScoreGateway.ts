import type { SessionStore } from '../../application/auth/SessionStore'
import type {
  FinishedMatch,
  LeaderboardEntry,
  ScoreGateway,
  ScoreSummary,
} from '../../application/ports/ScoreGateway'
import { LeaderboardPeriod, type GameMode } from '../../domain'
import type { ScoreApiClient } from '../http/ScoreApiClient'
import type { LocalScoreGateway } from '../storage/LocalScoreGateway'

/**
 * Combines the API and the browser storage (RF01):
 * - Logged players: everything comes from and goes to the API.
 * - Guests: personal best and own results stay in the browser; global numbers come from the API, and a guest
 *   may publish a match on the global ranking by informing a name.
 */
export class HybridScoreGateway implements ScoreGateway {
  private readonly api: ScoreApiClient
  private readonly local: LocalScoreGateway
  private readonly sessionStore: SessionStore

  constructor(api: ScoreApiClient, local: LocalScoreGateway, sessionStore: SessionStore) {
    this.api = api
    this.local = local
    this.sessionStore = sessionStore
  }

  async getSummary(mode: GameMode): Promise<ScoreSummary> {
    const token = this.token()
    try {
      const remote = await this.api.getSummary(mode, token)
      if (token) return remote
      const local = await this.local.getSummary(mode)
      return { ...remote, personalBest: local.personalBest }
    } catch {
      // Offline: show what the browser knows instead of an empty screen
      return this.local.getSummary(mode)
    }
  }

  getLeaderboard(mode: GameMode, period: LeaderboardPeriod): Promise<LeaderboardEntry[]> {
    const token = this.token()
    if (period === LeaderboardPeriod.USER && !token) {
      return this.local.getLeaderboard(mode, period)
    }
    return this.api.getLeaderboard(mode, period, token)
  }

  async saveScore(match: FinishedMatch): Promise<void> {
    const token = this.token()
    if (!token) {
      return this.local.saveScore(match)
    }
    try {
      await this.api.save(toRequest(match), token)
    } catch (error) {
      // Keep the result in the browser so it is not lost, then report the failure
      await this.local.saveScore(match)
      throw error
    }
  }

  async submitGuestScore(match: FinishedMatch, playerName: string): Promise<void> {
    await this.api.save({ ...toRequest(match), playerName: playerName.trim() }, null)
  }

  private token(): string | null {
    return this.sessionStore.getSession()?.accessToken ?? null
  }
}

function toRequest(match: FinishedMatch) {
  return { gameMode: match.mode, score: match.score, wrongAnswers: match.wrongAnswers }
}
