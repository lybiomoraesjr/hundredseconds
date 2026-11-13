import type { BrazilianRuler } from './BrazilianRuler'
import type { BrazilianState } from './BrazilianState'
import { GameMode, isTextMode, type MathGameMode, type StateGameMode } from './GameMode'

/**
 * A single math question.
 * - Exponentiation: operand^degree (operand = base, degree = exponent)
 * - Root extraction: degree-th root of operand (operand = radicand, degree = index)
 */
export interface MathQuestion {
  readonly id: string
  readonly mode: MathGameMode
  readonly operand: number
  readonly degree: number
  readonly answer: number
}

/**
 * A question about a Brazilian state, answered with text.
 * - Flags: shows the state flag, the answer is the state name
 * - Abbreviations: shows the state name, the answer is its abbreviation ("MG")
 * - Capitals: shows the state name, the answer is its capital
 * - Capital demonyms: shows the capital, the answer is its demonym ("soteropolitano")
 * - Map: highlights the state on the map of Brazil, the answer is the state name
 * - State demonyms: shows the state name, the answer is its demonym ("baiano")
 */
export interface StateQuestion {
  readonly id: string
  readonly mode: StateGameMode
  readonly stateCode: string
  /** Text shown to the player (unused by flags and map, which show an image). */
  readonly prompt: string
  /** Main answer, shown when the player misses. */
  readonly answer: string
  /** Every answer that counts as correct (includes the main one). */
  readonly acceptedAnswers: readonly string[]
}

/**
 * History: shows a period ("1930 a 1945") or an election year of someone who never took office,
 * the answer is who governed / was elected.
 */
export interface RulerQuestion {
  readonly id: string
  readonly mode: typeof GameMode.BRAZIL_RULERS
  readonly ruler: BrazilianRuler
  /** Main answer, shown when the player misses. */
  readonly answer: string
  /** Every answer that counts as correct (includes the main one). */
  readonly acceptedAnswers: readonly string[]
}

/** Any question answered with text. */
export type TextQuestion = StateQuestion | RulerQuestion

export type Question = MathQuestion | TextQuestion

export function isTextQuestion(question: Question): question is TextQuestion {
  return isTextMode(question.mode)
}

export function isRulerQuestion(question: Question): question is RulerQuestion {
  return question.mode === GameMode.BRAZIL_RULERS
}

export function createPowerQuestion(base: number, exponent: number): MathQuestion {
  return {
    id: `pow:${base}^${exponent}`,
    mode: GameMode.EXPONENTIATION,
    operand: base,
    degree: exponent,
    answer: base ** exponent,
  }
}

export function createRootQuestion(radicand: number, index: number): MathQuestion {
  const answer = Math.round(radicand ** (1 / index))
  if (answer ** index !== radicand) {
    throw new Error(`Root of index ${index} of ${radicand} is not exact`)
  }
  return {
    id: `root:${index}:${radicand}`,
    mode: GameMode.ROOT_EXTRACTION,
    operand: radicand,
    degree: index,
    answer,
  }
}

function stateQuestion(mode: StateGameMode, idPrefix: string, state: BrazilianState, prompt: string,
  answer: string, acceptedAnswers: readonly string[] = [answer]): StateQuestion {
  return { id: `${idPrefix}:${state.code}`, mode, stateCode: state.code, prompt, answer, acceptedAnswers }
}

export function createFlagQuestion(state: BrazilianState): StateQuestion {
  return stateQuestion(GameMode.STATE_FLAGS, 'flag', state, state.name, state.name)
}

export function createMapQuestion(state: BrazilianState): StateQuestion {
  return stateQuestion(GameMode.STATE_MAP, 'map', state, state.name, state.name)
}

export function createAbbreviationQuestion(state: BrazilianState): StateQuestion {
  return stateQuestion(GameMode.STATE_ABBREVIATIONS, 'abbreviation', state, state.name, state.code.toUpperCase())
}

export function createCapitalQuestion(state: BrazilianState): StateQuestion {
  return stateQuestion(GameMode.STATE_CAPITALS, 'capital', state, state.name, state.capital)
}

/** Demonyms are listed in the masculine form; the feminine one ("soteropolitana") is accepted too. */
function withFeminineForms(demonyms: readonly string[]): string[] {
  return demonyms.flatMap((demonym) => (demonym.endsWith('o') ? [demonym, `${demonym.slice(0, -1)}a`] : [demonym]))
}

export function createCapitalDemonymQuestion(state: BrazilianState): StateQuestion {
  const [main] = state.capitalDemonyms
  return stateQuestion(GameMode.CAPITAL_DEMONYMS, 'demonym', state, state.capital, main,
    withFeminineForms(state.capitalDemonyms))
}

export function createStateDemonymQuestion(state: BrazilianState): StateQuestion {
  const [main] = state.stateDemonyms
  return stateQuestion(GameMode.STATE_DEMONYMS, 'state-demonym', state, state.name, main,
    withFeminineForms(state.stateDemonyms))
}

export function createRulerQuestion(ruler: BrazilianRuler): RulerQuestion {
  return {
    id: `ruler:${ruler.id}`,
    mode: GameMode.BRAZIL_RULERS,
    ruler,
    answer: ruler.name,
    acceptedAnswers: [ruler.name, ...ruler.otherNames],
  }
}
