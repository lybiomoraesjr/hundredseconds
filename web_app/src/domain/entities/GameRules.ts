import { isStateMode, type GameMode } from './GameMode'

/** Fixed rules of the "100 seconds" game. */
export const GameRules = {
  DURATION_SECONDS: 100,
  COUNTDOWN_FROM: 3,
  /** Attempts per question before the answer is revealed (same for every game). */
  MAX_ATTEMPTS: 2,
  REVEAL_DURATION_MS: 1000,
  /** A little longer, so the player can read the state and its answer. */
  STATE_GAME_REVEAL_DURATION_MS: 1500,
  /** Rulers quiz: how long the right choice stays highlighted before the next question. */
  RULERS_CORRECT_FEEDBACK_MS: 600,
  /** Rulers quiz: a wrong choice shows the right one a little longer. */
  RULERS_WRONG_FEEDBACK_MS: 1500,
  /** A single beep plays when the remaining time reaches this value. */
  WARNING_SECONDS: 10,
  ANSWERS_PER_STAR: 10,
  MAX_STARS: 10,
} as const

export function revealDurationFor(mode: GameMode): number {
  return isStateMode(mode) ? GameRules.STATE_GAME_REVEAL_DURATION_MS : GameRules.REVEAL_DURATION_MS
}
