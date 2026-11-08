/** Game sounds. */
export interface Beeper {
  /** Must be called from a user gesture (click) so browsers allow audio later. */
  unlock(): void
  /** Short beep on each second of the 3-2-1 countdown. */
  countdownTick(): void
  /** Different, longer sound when the match starts. */
  start(): void
  /** Single warning when 10 seconds are left. */
  warning(): void
  /** Rewarding chime each time a star is earned. */
  star(): void
}
