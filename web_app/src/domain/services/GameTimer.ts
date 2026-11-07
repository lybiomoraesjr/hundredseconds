import { GameRules } from '../entities/GameRules'

/** Whole seconds left, never negative. Rounded up so "100" is shown at the start. */
export function remainingSeconds(startedAtMs: number, nowMs: number,
  durationSeconds: number = GameRules.DURATION_SECONDS): number {
  const elapsedMs = Math.max(0, nowMs - startedAtMs)
  return Math.max(0, Math.ceil(durationSeconds - elapsedMs / 1000))
}

/** Remaining time as a fraction from 1 (full) to 0 (empty), for the progress bar. */
export function remainingFraction(startedAtMs: number, nowMs: number,
  durationSeconds: number = GameRules.DURATION_SECONDS): number {
  const elapsedMs = Math.max(0, nowMs - startedAtMs)
  return Math.max(0, 1 - elapsedMs / (durationSeconds * 1000))
}

/** Beep on each of the last seconds (10 down to 0). */
export function shouldBeep(secondsLeft: number): boolean {
  return secondsLeft >= 0 && secondsLeft <= GameRules.WARNING_SECONDS
}
