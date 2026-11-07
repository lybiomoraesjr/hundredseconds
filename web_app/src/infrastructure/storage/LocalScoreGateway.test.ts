import { describe, expect, it } from 'vitest'
import { GameMode, LeaderboardPeriod } from '../../domain'
import { LocalScoreGateway } from './LocalScoreGateway'

class MemoryStorage {
  private readonly data = new Map<string, string>()
  getItem(key: string) {
    return this.data.get(key) ?? null
  }
  setItem(key: string, value: string) {
    this.data.set(key, value)
  }
}

function gatewayAt(storage: MemoryStorage, isoDate: string) {
  return new LocalScoreGateway({ storage, now: () => new Date(isoDate), playerName: 'Você' })
}

describe('LocalScoreGateway', () => {
  it('returns empty summary when nothing was played', async () => {
    const gateway = gatewayAt(new MemoryStorage(), '2026-03-15T12:00:00')
    expect(await gateway.getSummary(GameMode.EXPONENTIATION))
      .toEqual({ personalBest: null, todayBest: null, yearBest: null })
  })

  it('computes personal, today and year bests per mode', async () => {
    const storage = new MemoryStorage()
    await gatewayAt(storage, '2025-12-31T10:00:00').saveScore({ mode: GameMode.EXPONENTIATION, score: 90, wrongAnswers: 0 })
    await gatewayAt(storage, '2026-02-01T10:00:00').saveScore({ mode: GameMode.EXPONENTIATION, score: 60, wrongAnswers: 1 })
    await gatewayAt(storage, '2026-03-15T09:00:00').saveScore({ mode: GameMode.EXPONENTIATION, score: 30, wrongAnswers: 2 })
    await gatewayAt(storage, '2026-03-15T09:30:00').saveScore({ mode: GameMode.ROOT_EXTRACTION, score: 99, wrongAnswers: 0 })

    const gateway = gatewayAt(storage, '2026-03-15T12:00:00')
    expect(await gateway.getSummary(GameMode.EXPONENTIATION))
      .toEqual({ personalBest: 90, todayBest: 30, yearBest: 60 })
  })

  it('builds leaderboards ordered by score and limited to ten', async () => {
    const storage = new MemoryStorage()
    for (let i = 1; i <= 12; i++) {
      await gatewayAt(storage, `2026-03-1${i % 2 === 0 ? 5 : 1}T10:00:00`)
        .saveScore({ mode: GameMode.ROOT_EXTRACTION, score: i, wrongAnswers: 0 })
    }
    const gateway = gatewayAt(storage, '2026-03-15T12:00:00')

    const all = await gateway.getLeaderboard(GameMode.ROOT_EXTRACTION, LeaderboardPeriod.USER)
    expect(all).toHaveLength(10)
    expect(all[0]).toMatchObject({ rank: 1, score: 12, playerName: 'Você' })

    const today = await gateway.getLeaderboard(GameMode.ROOT_EXTRACTION, LeaderboardPeriod.DAY)
    expect(today.map((entry) => entry.score)).toEqual([12, 10, 8, 6, 4, 2])

    const week = await gateway.getLeaderboard(GameMode.ROOT_EXTRACTION, LeaderboardPeriod.WEEK)
    expect(week).toHaveLength(10)
  })

  it('survives broken or unavailable storage', async () => {
    const broken = {
      getItem: () => '{not json',
      setItem: () => {
        throw new Error('quota exceeded')
      },
    }
    const gateway = new LocalScoreGateway({ storage: broken, playerName: 'Você' })
    await expect(gateway.saveScore({ mode: GameMode.EXPONENTIATION, score: 1, wrongAnswers: 0 })).resolves.toBeUndefined()
    expect((await gateway.getSummary(GameMode.EXPONENTIATION)).personalBest).toBeNull()

    const none = new LocalScoreGateway({ storage: null, playerName: 'Você' })
    expect(await none.getLeaderboard(GameMode.EXPONENTIATION, LeaderboardPeriod.DAY)).toEqual([])
  })
})
