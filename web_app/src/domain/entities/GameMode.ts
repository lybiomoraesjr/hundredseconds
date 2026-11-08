/** Game modes; values match the API contract. */
export const GameMode = {
  EXPONENTIATION: 'EXPONENTIATION',
  ROOT_EXTRACTION: 'ROOT_EXTRACTION',
  STATE_FLAGS: 'STATE_FLAGS',
  STATE_ABBREVIATIONS: 'STATE_ABBREVIATIONS',
} as const

export type GameMode = (typeof GameMode)[keyof typeof GameMode]

/** Modes whose questions are math expressions with a numeric answer. */
export type MathGameMode = typeof GameMode.EXPONENTIATION | typeof GameMode.ROOT_EXTRACTION

/** Modes that ask something about a Brazilian state; the answer is typed as text. */
export type StateGameMode = typeof GameMode.STATE_FLAGS | typeof GameMode.STATE_ABBREVIATIONS

export function isMathMode(mode: GameMode): mode is MathGameMode {
  return mode === GameMode.EXPONENTIATION || mode === GameMode.ROOT_EXTRACTION
}

export function isStateMode(mode: GameMode): mode is StateGameMode {
  return !isMathMode(mode)
}
