import { DifficultyLevel } from '../entities/DifficultyLevel'

export const EASY_MAX_SCORE = 25
export const MEDIUM_MAX_SCORE = 95

/** Difficulty is based on the correct answers of the current match. */
export function resolveDifficultyLevel(score: number): DifficultyLevel {
  if (score <= EASY_MAX_SCORE) {
    return DifficultyLevel.EASY
  }
  if (score <= MEDIUM_MAX_SCORE) {
    return DifficultyLevel.MEDIUM
  }
  return DifficultyLevel.ADVANCED
}
