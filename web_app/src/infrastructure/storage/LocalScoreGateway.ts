import type {
  FinishedMatch,
  LeaderboardEntry,
  ScoreGateway,
  ScoreSummary,
} from '../../application/ports/ScoreGateway'
import { LeaderboardPeriod, type GameMode } from '../../domain'

interface StoredMatch extends FinishedMatch {
  readonly playedAt: string
}

const STORAGE_KEY = 'hundred-seconds:matches'
const LEADERBOARD_SIZE = 10
const WEEK_DAYS = 7

/**
 * Keeps the matches in the browser (localStorage). Used for guests and while the API is not connected.
 * Storage failures (private mode, blocked storage) never break the game.
 */
export class LocalScoreGateway implements Omit<ScoreGateway, 'submitGuestScore'> {
  private readonly storage: Pick<Storage, 'getItem' | 'setItem'> | null
  private readonly now: () => Date
  private readonly playerName: string

  constructor(options: {
    storage?: Pick<Storage, 'getItem' | 'setItem'> | null
    now?: () => Date
    playerName: string
  }) {
    this.storage = options.storage === undefined ? safeLocalStorage() : options.storage
    this.now = options.now ?? (() => new Date())
    this.playerName = options.playerName
  }

  async getSummary(mode: GameMode): Promise<ScoreSummary> {
    const matches = this.matchesOf(mode)
    const best = (list: StoredMatch[]) => (list.length ? Math.max(...list.map((m) => m.score)) : null)
    return {
      personalBest: best(matches),
      todayBest: best(this.since(matches, this.startOf(LeaderboardPeriod.DAY))),
      yearBest: best(this.since(matches, this.startOf(LeaderboardPeriod.YEAR))),
    }
  }

  async getLeaderboard(mode: GameMode, period: LeaderboardPeriod): Promise<LeaderboardEntry[]> {
    const matches = this.matchesOf(mode)
    const inPeriod = period === LeaderboardPeriod.USER ? matches : this.since(matches, this.startOf(period))
    return [...inPeriod]
      .sort((a, b) => b.score - a.score || a.playedAt.localeCompare(b.playedAt))
      .slice(0, LEADERBOARD_SIZE)
      .map((match, index) => ({
        rank: index + 1,
        playerName: this.playerName,
        score: match.score,
        playedAt: match.playedAt,
      }))
  }

  async saveScore(match: FinishedMatch): Promise<void> {
    const stored: StoredMatch = { ...match, playedAt: this.now().toISOString() }
    this.write([...this.readAll(), stored])
  }

  private matchesOf(mode: GameMode): StoredMatch[] {
    return this.readAll().filter((match) => match.mode === mode)
  }

  private since(matches: StoredMatch[], start: Date): StoredMatch[] {
    return matches.filter((match) => new Date(match.playedAt) >= start)
  }

  /** Start of the period in the browser's local time. */
  private startOf(period: LeaderboardPeriod): Date {
    const today = this.now()
    today.setHours(0, 0, 0, 0)
    if (period === LeaderboardPeriod.WEEK) {
      today.setDate(today.getDate() - (WEEK_DAYS - 1))
    } else if (period === LeaderboardPeriod.YEAR) {
      today.setMonth(0, 1)
    }
    return today
  }

  private readAll(): StoredMatch[] {
    try {
      const raw = this.storage?.getItem(STORAGE_KEY)
      const parsed: unknown = raw ? JSON.parse(raw) : []
      return Array.isArray(parsed) ? (parsed as StoredMatch[]) : []
    } catch {
      return []
    }
  }

  private write(matches: StoredMatch[]): void {
    try {
      this.storage?.setItem(STORAGE_KEY, JSON.stringify(matches))
    } catch {
      // Ignore quota or permission errors
    }
  }
}

function safeLocalStorage(): Storage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}
