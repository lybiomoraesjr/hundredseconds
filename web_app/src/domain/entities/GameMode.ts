/** Game modes; values match the API contract. */
export const GameMode = {
  EXPONENTIATION: 'EXPONENTIATION',
  ROOT_EXTRACTION: 'ROOT_EXTRACTION',
  STATE_FLAGS: 'STATE_FLAGS',
  STATE_ABBREVIATIONS: 'STATE_ABBREVIATIONS',
  STATE_CAPITALS: 'STATE_CAPITALS',
  CAPITAL_DEMONYMS: 'CAPITAL_DEMONYMS',
  STATE_MAP: 'STATE_MAP',
  STATE_DEMONYMS: 'STATE_DEMONYMS',
  BRAZIL_RULERS: 'BRAZIL_RULERS',
} as const

export type GameMode = (typeof GameMode)[keyof typeof GameMode]

/** Modes whose questions are math expressions with a numeric answer. */
export type MathGameMode = typeof GameMode.EXPONENTIATION | typeof GameMode.ROOT_EXTRACTION

/** Modes that ask something about a Brazilian state (or its capital). */
export type StateGameMode =
  | typeof GameMode.STATE_FLAGS
  | typeof GameMode.STATE_ABBREVIATIONS
  | typeof GameMode.STATE_CAPITALS
  | typeof GameMode.CAPITAL_DEMONYMS
  | typeof GameMode.STATE_MAP
  | typeof GameMode.STATE_DEMONYMS

/** Modes whose answer is typed as text: the state games and the history game. */
export type TextGameMode = StateGameMode | typeof GameMode.BRAZIL_RULERS

export function isMathMode(mode: GameMode): mode is MathGameMode {
  return mode === GameMode.EXPONENTIATION || mode === GameMode.ROOT_EXTRACTION
}

export function isTextMode(mode: GameMode): mode is TextGameMode {
  return !isMathMode(mode)
}

export function isStateMode(mode: GameMode): mode is StateGameMode {
  return isTextMode(mode) && mode !== GameMode.BRAZIL_RULERS
}
