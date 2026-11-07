import { describe, expect, it } from 'vitest'
import { DifficultyLevel } from '../entities/DifficultyLevel'
import { GameMode } from '../entities/GameMode'
import { questionsBelow, questionsFor } from './QuestionCatalog'
import { CURRENT_LEVEL_PROBABILITY, QuestionGenerator } from './QuestionGenerator'

const idsOf = (mode: GameMode, level: DifficultyLevel) => questionsFor(mode, level).map((q) => q.id)

/** Returns the given values in order, then repeats the last one. */
const sequence = (...values: number[]) => {
  let index = 0
  return () => values[Math.min(index++, values.length - 1)]
}

describe('QuestionGenerator', () => {
  it('only uses easy questions on the easy level', () => {
    const generator = new QuestionGenerator()
    const easy = idsOf(GameMode.EXPONENTIATION, DifficultyLevel.EASY)
    for (let i = 0; i < 200; i++) {
      expect(easy).toContain(generator.next(GameMode.EXPONENTIATION, 10).id)
    }
  })

  it('draws from the current level when the first random value is below the threshold', () => {
    const generator = new QuestionGenerator(sequence(CURRENT_LEVEL_PROBABILITY - 0.01, 0))
    const question = generator.next(GameMode.ROOT_EXTRACTION, 120)
    expect(idsOf(GameMode.ROOT_EXTRACTION, DifficultyLevel.ADVANCED)).toContain(question.id)
  })

  it('draws from the lower levels when the first random value is above the threshold', () => {
    const generator = new QuestionGenerator(sequence(CURRENT_LEVEL_PROBABILITY, 0))
    const question = generator.next(GameMode.ROOT_EXTRACTION, 120)
    const lower = questionsBelow(GameMode.ROOT_EXTRACTION, DifficultyLevel.ADVANCED).map((q) => q.id)
    expect(lower).toContain(question.id)
  })

  it('mixes current and lower level questions at roughly 70/30 on higher levels', () => {
    const generator = new QuestionGenerator()
    const medium = new Set(idsOf(GameMode.EXPONENTIATION, DifficultyLevel.MEDIUM))
    const easy = new Set(idsOf(GameMode.EXPONENTIATION, DifficultyLevel.EASY))
    const draws = 5000
    let fromCurrent = 0
    for (let i = 0; i < draws; i++) {
      const id = generator.next(GameMode.EXPONENTIATION, 50).id
      expect(medium.has(id) || easy.has(id)).toBe(true)
      if (medium.has(id)) fromCurrent++
    }
    expect(fromCurrent / draws).toBeGreaterThan(0.65)
    expect(fromCurrent / draws).toBeLessThan(0.75)
  })

  it('never repeats the previous question', () => {
    const generator = new QuestionGenerator()
    let previous = generator.next(GameMode.EXPONENTIATION, 0)
    for (let i = 0; i < 2000; i++) {
      const next = generator.next(GameMode.EXPONENTIATION, i % 150, previous)
      expect(next.id).not.toBe(previous.id)
      previous = next
    }
  })

  it('skips the previous question even when the random source points to it', () => {
    const first = questionsFor(GameMode.ROOT_EXTRACTION, DifficultyLevel.EASY)[0]
    const alwaysFirst = new QuestionGenerator(() => 0)

    expect(alwaysFirst.next(GameMode.ROOT_EXTRACTION, 0).id).toBe(first.id)
    expect(alwaysFirst.next(GameMode.ROOT_EXTRACTION, 0, first).id).not.toBe(first.id)
  })

  it('handles a random source returning values close to 1', () => {
    const generator = new QuestionGenerator(() => 0.999999999)
    expect(generator.next(GameMode.EXPONENTIATION, 0)).toBeDefined()
    expect(generator.next(GameMode.EXPONENTIATION, 120)).toBeDefined()
  })
})
