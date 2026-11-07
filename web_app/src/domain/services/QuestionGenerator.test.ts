import { describe, expect, it } from 'vitest'
import { DifficultyLevel } from '../entities/DifficultyLevel'
import { GameMode } from '../entities/GameMode'
import { questionsFor } from './QuestionCatalog'
import { QuestionGenerator } from './QuestionGenerator'

describe('QuestionGenerator', () => {
  it('draws from the level matching the score', () => {
    const generator = new QuestionGenerator()
    const levels: Array<[number, DifficultyLevel]> = [
      [0, DifficultyLevel.EASY], [30, DifficultyLevel.MEDIUM], [120, DifficultyLevel.ADVANCED]]

    for (const [score, level] of levels) {
      const allowed = questionsFor(GameMode.ROOT_EXTRACTION, level).map((q) => q.id)
      for (let i = 0; i < 50; i++) {
        expect(allowed).toContain(generator.next(GameMode.ROOT_EXTRACTION, score).id)
      }
    }
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
  })
})
