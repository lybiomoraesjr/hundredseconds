import type { BrazilianState } from './BrazilianState'
import { GameMode, type MathGameMode } from './GameMode'

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

/** Shows the flag of a state; the answer is the state name. */
export interface FlagQuestion {
  readonly id: string
  readonly mode: typeof GameMode.STATE_FLAGS
  readonly stateCode: string
  readonly answer: string
}

export type Question = MathQuestion | FlagQuestion

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

export function createFlagQuestion(state: BrazilianState): FlagQuestion {
  return {
    id: `flag:${state.code}`,
    mode: GameMode.STATE_FLAGS,
    stateCode: state.code,
    answer: state.name,
  }
}
