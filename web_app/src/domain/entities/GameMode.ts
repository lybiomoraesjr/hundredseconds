/** Game modes; values match the API contract. */
export const GameMode = {
  EXPONENTIATION: 'EXPONENTIATION',
  ROOT_EXTRACTION: 'ROOT_EXTRACTION',
  STATE_FLAGS: 'STATE_FLAGS',
} as const

export type GameMode = (typeof GameMode)[keyof typeof GameMode]

/** Modes whose questions are math expressions with a numeric answer. */
export type MathGameMode = typeof GameMode.EXPONENTIATION | typeof GameMode.ROOT_EXTRACTION

export function isMathMode(mode: GameMode): mode is MathGameMode {
  return mode === GameMode.EXPONENTIATION || mode === GameMode.ROOT_EXTRACTION
}
