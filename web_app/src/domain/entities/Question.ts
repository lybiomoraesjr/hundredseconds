import type { BrazilianState } from './BrazilianState'
import { GameMode, isStateMode, type MathGameMode, type StateGameMode } from './GameMode'

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
 */
export interface StateQuestion {
  readonly id: string
  readonly mode: StateGameMode
  readonly stateCode: string
  readonly stateName: string
  readonly answer: string
}

export type Question = MathQuestion | StateQuestion

export function isStateQuestion(question: Question): question is StateQuestion {
  return isStateMode(question.mode)
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

export function createFlagQuestion(state: BrazilianState): StateQuestion {
  return {
    id: `flag:${state.code}`,
    mode: GameMode.STATE_FLAGS,
    stateCode: state.code,
    stateName: state.name,
    answer: state.name,
  }
}

export function createAbbreviationQuestion(state: BrazilianState): StateQuestion {
  return {
    id: `abbreviation:${state.code}`,
    mode: GameMode.STATE_ABBREVIATIONS,
    stateCode: state.code,
    stateName: state.name,
    answer: state.code.toUpperCase(),
  }
}
