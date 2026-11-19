import { RulerEra } from './BrazilianRuler'

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
  RULERS_EMPIRE: 'RULERS_EMPIRE',
  RULERS_OLD_REPUBLIC: 'RULERS_OLD_REPUBLIC',
  RULERS_VARGAS_ERA: 'RULERS_VARGAS_ERA',
  RULERS_MILITARY: 'RULERS_MILITARY',
  RULERS_NEW_REPUBLIC: 'RULERS_NEW_REPUBLIC',
  RULERS_ALL: 'RULERS_ALL',
} as const

export type GameMode = (typeof GameMode)[keyof typeof GameMode]

/** Modes whose questions are math expressions with a numeric answer. */
export type MathGameMode = typeof GameMode.EXPONENTIATION | typeof GameMode.ROOT_EXTRACTION

/** Modes that ask something about a Brazilian state (or its capital); the answer is typed as text. */
export type StateGameMode =
  | typeof GameMode.STATE_FLAGS
  | typeof GameMode.STATE_ABBREVIATIONS
  | typeof GameMode.STATE_CAPITALS
  | typeof GameMode.CAPITAL_DEMONYMS
  | typeof GameMode.STATE_MAP
  | typeof GameMode.STATE_DEMONYMS

/**
 * Time trials about who governed Brazil: every ruler of an era (or of all eras) is asked once,
 * with no time limit, and ties are broken by the shortest time.
 */
export type RulersGameMode =
  | typeof GameMode.RULERS_EMPIRE
  | typeof GameMode.RULERS_OLD_REPUBLIC
  | typeof GameMode.RULERS_VARGAS_ERA
  | typeof GameMode.RULERS_MILITARY
  | typeof GameMode.RULERS_NEW_REPUBLIC
  | typeof GameMode.RULERS_ALL

/** The 100 second games. */
export type TimedGameMode = MathGameMode | StateGameMode

/** Era asked by each rulers mode; null asks every era. */
export const ERA_OF_RULERS_MODE: Readonly<Record<RulersGameMode, RulerEra | null>> = {
  [GameMode.RULERS_EMPIRE]: RulerEra.EMPIRE,
  [GameMode.RULERS_OLD_REPUBLIC]: RulerEra.OLD_REPUBLIC,
  [GameMode.RULERS_VARGAS_ERA]: RulerEra.VARGAS_ERA,
  [GameMode.RULERS_MILITARY]: RulerEra.MILITARY,
  [GameMode.RULERS_NEW_REPUBLIC]: RulerEra.NEW_REPUBLIC,
  [GameMode.RULERS_ALL]: null,
}

export function isRulersMode(mode: GameMode): mode is RulersGameMode {
  return mode in ERA_OF_RULERS_MODE
}

export function isMathMode(mode: GameMode): mode is MathGameMode {
  return mode === GameMode.EXPONENTIATION || mode === GameMode.ROOT_EXTRACTION
}

export function isStateMode(mode: GameMode): mode is StateGameMode {
  return !isMathMode(mode) && !isRulersMode(mode)
}
