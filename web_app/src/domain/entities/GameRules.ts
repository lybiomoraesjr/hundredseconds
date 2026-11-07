/** Fixed rules of the "100 seconds" game. */
export const GameRules = {
  DURATION_SECONDS: 100,
  COUNTDOWN_FROM: 3,
  /** Attempts per question before the answer is revealed. */
  MAX_ATTEMPTS: 2,
  REVEAL_DURATION_MS: 1000,
  /** Beep on every second while remaining time is at or below this value. */
  WARNING_SECONDS: 10,
  ANSWERS_PER_STAR: 10,
  MAX_STARS: 10,
} as const
