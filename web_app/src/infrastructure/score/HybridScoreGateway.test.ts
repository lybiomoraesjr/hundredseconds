import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SessionStore } from '../../application/auth/SessionStore'
import { GameMode, LeaderboardPeriod } from '../../domain'
import { ApiError } from '../http/ApiError'
import type { ScoreApiClient } from '../http/ScoreApiClient'
import { LocalScoreGateway } from '../storage/LocalScoreGateway'
import { HybridScoreGateway } from './HybridScoreGateway'

class MemoryStorage {
  private readonly data = new Map<string, string>()
  getItem = (key: string) => this.data.get(key) ?? null
  setItem = (key: string, value: string) => void this.data.set(key, value)
}

const MATCH = { mode: GameMode.EXPONENTIATION, score: 42, wrongAnswers: 3 }

describe('HybridScoreGateway', () => {
  let api: { getSummary: ReturnType<typeof vi.fn>; getLeaderboard: ReturnType<typeof vi.fn>; save: ReturnType<typeof vi.fn> }
  let local: LocalScoreGateway
  let store: SessionStore
  let gateway: HybridScoreGateway

  beforeEach(() => {
    api = {
      getSummary: vi.fn().mockResolvedValue({ personalBest: null, todayBest: 80, yearBest: 118 }),
      getLeaderboard: vi.fn().mockResolvedValue([]),
      save: vi.fn().mockResolvedValue(undefined),
    }
    local = new LocalScoreGateway({ storage: new MemoryStorage(), playerName: 'Você' })
    store = new SessionStore({ load: () => null, save: () => {}, clear: () => {} })
    gateway = new HybridScoreGateway(api as unknown as ScoreApiClient, local, store)
  })

  const logIn = () => store.setSession({ accessToken: 'jwt', userId: 'u1', username: 'Ana', expiresAtMs: Date.now() + 60_000 })

  describe('guest', () => {
    it('saves matches only in the browser', async () => {
      await gateway.saveScore(MATCH)
      expect(api.save).not.toHaveBeenCalled()
      expect((await local.getSummary(GameMode.EXPONENTIATION)).personalBest).toBe(42)
    })

    it('mixes the local personal best with global numbers', async () => {
      await local.saveScore(MATCH)
      expect(await gateway.getSummary(GameMode.EXPONENTIATION)).toEqual({ personalBest: 42, todayBest: 80, yearBest: 118 })
      expect(api.getSummary).toHaveBeenCalledWith(GameMode.EXPONENTIATION, null)
    })

    it('falls back to local numbers when the API is unreachable', async () => {
      api.getSummary.mockRejectedValue(new ApiError(0, 'NETWORK_ERROR', 'offline'))
      await local.saveScore(MATCH)
      expect((await gateway.getSummary(GameMode.EXPONENTIATION)).todayBest).toBe(42)
    })

    it('reads own results locally and global tabs from the API', async () => {
      await local.saveScore(MATCH)
      expect(await gateway.getLeaderboard(GameMode.EXPONENTIATION, LeaderboardPeriod.USER))
        .toMatchObject([{ rank: 1, score: 42, playerName: 'Você' }])
      await gateway.getLeaderboard(GameMode.EXPONENTIATION, LeaderboardPeriod.DAY)
      expect(api.getLeaderboard).toHaveBeenCalledWith(GameMode.EXPONENTIATION, LeaderboardPeriod.DAY, null)
    })

    it('publishes on the global ranking with the informed name and no token', async () => {
      await gateway.submitGuestScore(MATCH, '  Visitante ')
      expect(api.save).toHaveBeenCalledWith(
        { gameMode: GameMode.EXPONENTIATION, score: 42, wrongAnswers: 3, playerName: 'Visitante' }, null)
    })
  })

  describe('logged player', () => {
    it('saves on the API with the token', async () => {
      logIn()
      await gateway.saveScore(MATCH)
      expect(api.save).toHaveBeenCalledWith({ gameMode: GameMode.EXPONENTIATION, score: 42, wrongAnswers: 3 }, 'jwt')
    })

    it('keeps the match locally when the API save fails', async () => {
      logIn()
      api.save.mockRejectedValue(new ApiError(0, 'NETWORK_ERROR', 'offline'))
      await expect(gateway.saveScore(MATCH)).rejects.toBeInstanceOf(ApiError)
      expect((await local.getSummary(GameMode.EXPONENTIATION)).personalBest).toBe(42)
    })

    it('uses the API for summary and own results', async () => {
      logIn()
      api.getSummary.mockResolvedValue({ personalBest: 99, todayBest: 99, yearBest: 120 })
      expect((await gateway.getSummary(GameMode.ROOT_EXTRACTION)).personalBest).toBe(99)
      await gateway.getLeaderboard(GameMode.ROOT_EXTRACTION, LeaderboardPeriod.USER)
      expect(api.getLeaderboard).toHaveBeenCalledWith(GameMode.ROOT_EXTRACTION, LeaderboardPeriod.USER, 'jwt')
    })
  })
})
