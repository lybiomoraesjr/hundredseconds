export interface Beeper {
  /** Must be called from a user gesture (click) so browsers allow audio later. */
  unlock(): void
  beep(): void
}
