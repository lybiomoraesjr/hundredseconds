import { GameMode } from './GameMode'

/** Fixed rules of the "100 seconds" game. */
export const GameRules = {
  DURATION_SECONDS: 100,
  COUNTDOWN_FROM: 3,
  /** Attempts per math question before the answer is revealed. */
  MAX_ATTEMPTS: 2,
  /** Flags reveal the answer right after the first mistake. */
  FLAG_MAX_ATTEMPTS: 1,
  REVEAL_DURATION_MS: 1000,
  /** A little longer, so the player can look at the flag and read the state name. */
  FLAG_REVEAL_DURATION_MS: 1500,
  /** A single beep plays when the remaining time reaches this value. */
  WARNING_SECONDS: 10,
  ANSWERS_PER_STAR: 10,
  MAX_STARS: 10,
} as const

export function maxAttemptsFor(mode: GameMode): number {
  return mode === GameMode.STATE_FLAGS ? GameRules.FLAG_MAX_ATTEMPTS : GameRules.MAX_ATTEMPTS
}

export function revealDurationFor(mode: GameMode): number {
  return mode === GameMode.STATE_FLAGS ? GameRules.FLAG_REVEAL_DURATION_MS : GameRules.REVEAL_DURATION_MS
}
