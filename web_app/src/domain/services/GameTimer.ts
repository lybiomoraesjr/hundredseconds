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

/**
 * True only on the tick where the remaining time reaches the warning threshold, so the beep plays once.
 * Comparing with the previous tick keeps it working even if a tick is skipped.
 */
export function shouldPlayWarning(previousSecondsLeft: number, secondsLeft: number): boolean {
  return previousSecondsLeft > GameRules.WARNING_SECONDS && secondsLeft <= GameRules.WARNING_SECONDS
}
