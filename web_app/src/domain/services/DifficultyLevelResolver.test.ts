import { describe, expect, it } from 'vitest'
import { DifficultyLevel } from '../entities/DifficultyLevel'
import { resolveDifficultyLevel } from './DifficultyLevelResolver'

describe('resolveDifficultyLevel', () => {
  it.each([
    [0, DifficultyLevel.EASY],
    [25, DifficultyLevel.EASY],
    [26, DifficultyLevel.MEDIUM],
    [95, DifficultyLevel.MEDIUM],
    [96, DifficultyLevel.ADVANCED],
    [200, DifficultyLevel.ADVANCED],
  ])('score %i is %s', (score, level) => {
    expect(resolveDifficultyLevel(score)).toBe(level)
  })
})
