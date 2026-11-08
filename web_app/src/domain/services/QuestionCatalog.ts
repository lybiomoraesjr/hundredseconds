import { DifficultyLevel } from '../entities/DifficultyLevel'
import { BRAZILIAN_STATES } from '../entities/BrazilianState'
import { GameMode, type MathGameMode } from '../entities/GameMode'
import {
  createFlagQuestion,
  createPowerQuestion,
  createRootQuestion,
  type FlagQuestion,
  type MathQuestion,
} from '../entities/Question'

const range = (from: number, to: number): number[] =>
  Array.from({ length: to - from + 1 }, (_, index) => from + index)

const powers = (pairs: Array<[base: number, exponent: number]>): MathQuestion[] =>
  pairs.map(([base, exponent]) => createPowerQuestion(base, exponent))

const roots = (index: number, radicands: number[]): MathQuestion[] =>
  radicands.map((radicand) => createRootQuestion(radicand, index))

// Section 2.4 of the requirements specification
const EXPONENTIATION_QUESTIONS: Record<DifficultyLevel, MathQuestion[]> = {
  [DifficultyLevel.EASY]: [
    // Bases 0, 1 and 10 with simple exponents
    ...powers([[0, 2], [0, 3], [1, 2], [1, 3], [1, 4], [1, 5], [10, 2], [10, 3]]),
    // Any base from 0 to 10 raised to 0 or 1 (0^0 = 1 by the school convention)
    ...range(0, 10).flatMap((base) => powers([[base, 0], [base, 1]])),
    // Basic perfect squares
    ...range(2, 5).flatMap((base) => powers([[base, 2]])),
  ],
  [DifficultyLevel.MEDIUM]: [
    ...range(6, 10).flatMap((base) => powers([[base, 2]])),
    ...range(2, 5).flatMap((base) => powers([[base, 3]])),
    ...powers([[2, 4], [2, 5], [2, 6], [3, 4]]),
  ],
  [DifficultyLevel.ADVANCED]: [
    ...[...range(11, 15), 20].flatMap((base) => powers([[base, 2]])),
    ...range(6, 9).flatMap((base) => powers([[base, 3]])),
    ...range(7, 10).flatMap((exponent) => powers([[2, exponent]])),
  ],
}

const ROOT_EXTRACTION_QUESTIONS: Record<DifficultyLevel, MathQuestion[]> = {
  [DifficultyLevel.EASY]: [...roots(2, [0, 1, 4, 9, 16, 25, 100])],
  [DifficultyLevel.MEDIUM]: [
    ...roots(2, [36, 49, 64, 81, 100]),
    ...roots(3, [0, 1, 8, 27, 64, 125, 1000]),
    ...roots(4, [16]),
    ...roots(5, [32]),
  ],
  [DifficultyLevel.ADVANCED]: [
    ...roots(2, [121, 144, 169, 196, 225, 400]),
    ...roots(3, [216, 343, 512, 729]),
    ...roots(4, [81, 256]),
    ...roots(5, [243]),
  ],
}

const CATALOG: Record<MathGameMode, Record<DifficultyLevel, MathQuestion[]>> = {
  [GameMode.EXPONENTIATION]: EXPONENTIATION_QUESTIONS,
  [GameMode.ROOT_EXTRACTION]: ROOT_EXTRACTION_QUESTIONS,
}

const LEVEL_ORDER: readonly DifficultyLevel[] = [
  DifficultyLevel.EASY,
  DifficultyLevel.MEDIUM,
  DifficultyLevel.ADVANCED,
]

/** Questions introduced at the given level. */
export function questionsFor(mode: MathGameMode, level: DifficultyLevel): readonly MathQuestion[] {
  return CATALOG[mode][level]
}

/** Questions of every level below the given one (empty for EASY). */
export function questionsBelow(mode: MathGameMode, level: DifficultyLevel): readonly MathQuestion[] {
  return LEVEL_ORDER.slice(0, LEVEL_ORDER.indexOf(level)).flatMap((lower) => CATALOG[mode][lower])
}

/** One question per state flag (no difficulty levels). */
export const FLAG_QUESTIONS: readonly FlagQuestion[] = BRAZILIAN_STATES.map(createFlagQuestion)
