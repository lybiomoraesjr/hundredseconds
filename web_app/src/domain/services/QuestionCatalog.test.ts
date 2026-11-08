import { describe, expect, it } from 'vitest'
import { DifficultyLevel } from '../entities/DifficultyLevel'
import { GameMode, isMathMode, type MathGameMode } from '../entities/GameMode'
import { questionsBelow, questionsFor } from './QuestionCatalog'

const ids = (mode: MathGameMode, level: DifficultyLevel) => questionsFor(mode, level).map((q) => q.id)

describe('QuestionCatalog', () => {
  const allCombinations = Object.values(GameMode).filter(isMathMode).flatMap((mode) =>
    Object.values(DifficultyLevel).map((level) => [mode, level] as const))

  it.each(allCombinations)('%s / %s has correct, mode-consistent answers', (mode, level) => {
    const questions = questionsFor(mode, level)
    expect(questions.length).toBeGreaterThan(1)
    for (const question of questions) {
      expect(question.mode).toBe(mode)
      if (mode === GameMode.EXPONENTIATION) {
        expect(question.answer).toBe(question.operand ** question.degree)
      } else {
        expect(question.answer ** question.degree).toBe(question.operand)
      }
    }
  })

  it.each(allCombinations)('%s / %s has no duplicated questions', (mode, level) => {
    const list = ids(mode, level)
    // Several rules feed the same level, so make sure none of them overlap
    expect(new Set(list).size).toBe(list.length)
  })

  it('includes 0^0 = 1 in the easy level', () => {
    const zeroToZero = questionsFor(GameMode.EXPONENTIATION, DifficultyLevel.EASY).find((q) => q.id === 'pow:0^0')
    expect(zeroToZero?.answer).toBe(1)
  })

  it('lists the questions of the lower levels', () => {
    const easy = ids(GameMode.ROOT_EXTRACTION, DifficultyLevel.EASY)
    const medium = ids(GameMode.ROOT_EXTRACTION, DifficultyLevel.MEDIUM)
    const below = (level: DifficultyLevel) => questionsBelow(GameMode.ROOT_EXTRACTION, level).map((q) => q.id)

    expect(below(DifficultyLevel.EASY)).toEqual([])
    expect(below(DifficultyLevel.MEDIUM)).toEqual(easy)
    expect(below(DifficultyLevel.ADVANCED)).toEqual([...easy, ...medium])
  })

  it('follows the easy level of the specification', () => {
    const easyPowers = ids(GameMode.EXPONENTIATION, DifficultyLevel.EASY)
    expect(easyPowers).toEqual(expect.arrayContaining(
      ['pow:0^2', 'pow:1^4', 'pow:10^2', 'pow:10^3', 'pow:7^0', 'pow:9^1', 'pow:2^2', 'pow:5^2']))
    expect(easyPowers).not.toContain('pow:6^2')

    expect(ids(GameMode.ROOT_EXTRACTION, DifficultyLevel.EASY)).toEqual(
      ['root:2:0', 'root:2:1', 'root:2:4', 'root:2:9', 'root:2:16', 'root:2:25', 'root:2:100'])
  })

  it('follows the medium level of the specification', () => {
    expect(ids(GameMode.EXPONENTIATION, DifficultyLevel.MEDIUM)).toEqual(expect.arrayContaining(
      ['pow:6^2', 'pow:10^2', 'pow:2^3', 'pow:5^3', 'pow:2^4', 'pow:2^6', 'pow:3^4']))
    expect(ids(GameMode.ROOT_EXTRACTION, DifficultyLevel.MEDIUM)).toEqual(expect.arrayContaining(
      ['root:2:36', 'root:2:100', 'root:3:0', 'root:3:1000', 'root:4:16', 'root:5:32']))
  })

  it('follows the advanced level of the specification', () => {
    expect(ids(GameMode.EXPONENTIATION, DifficultyLevel.ADVANCED)).toEqual(expect.arrayContaining(
      ['pow:11^2', 'pow:15^2', 'pow:20^2', 'pow:6^3', 'pow:9^3', 'pow:2^7', 'pow:2^10']))
    expect(ids(GameMode.ROOT_EXTRACTION, DifficultyLevel.ADVANCED)).toEqual(expect.arrayContaining(
      ['root:2:121', 'root:2:225', 'root:2:400', 'root:3:216', 'root:3:729', 'root:4:81', 'root:4:256',
        'root:5:243']))
  })
})
