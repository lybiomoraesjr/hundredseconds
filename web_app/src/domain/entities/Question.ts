import { GameMode } from './GameMode'

/**
 * A single math question.
 * - Exponentiation: operand^degree (operand = base, degree = exponent)
 * - Root extraction: degree-th root of operand (operand = radicand, degree = index)
 */
export interface Question {
  readonly id: string
  readonly mode: GameMode
  readonly operand: number
  readonly degree: number
  readonly answer: number
}

export function createPowerQuestion(base: number, exponent: number): Question {
  return {
    id: `pow:${base}^${exponent}`,
    mode: GameMode.EXPONENTIATION,
    operand: base,
    degree: exponent,
    answer: base ** exponent,
  }
}

export function createRootQuestion(radicand: number, index: number): Question {
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
