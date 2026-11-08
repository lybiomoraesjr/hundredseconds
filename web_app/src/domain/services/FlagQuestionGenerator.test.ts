import { describe, expect, it } from 'vitest'
import { GameMode } from '../entities/GameMode'
import { FLAG_QUESTIONS } from './QuestionCatalog'
import { QuestionGenerator } from './QuestionGenerator'

describe('QuestionGenerator with flags', () => {
  it('has one question per state flag', () => {
    expect(FLAG_QUESTIONS).toHaveLength(27)
  })

  it('shows every flag once before repeating any of them', () => {
    const generator = new QuestionGenerator()
    const used: string[] = []
    let previous = generator.next(GameMode.STATE_FLAGS, 0)
    used.push(previous.id)
    for (let i = 1; i < 27; i++) {
      previous = generator.next(GameMode.STATE_FLAGS, i, previous, used)
      used.push(previous.id)
    }
    expect(new Set(used).size).toBe(27)
  })

  it('starts a new round when every flag was shown, never repeating the last one', () => {
    const generator = new QuestionGenerator(() => 0.999)
    const all = FLAG_QUESTIONS.map((question) => question.id)
    const last = FLAG_QUESTIONS[FLAG_QUESTIONS.length - 1]
    for (let i = 0; i < 50; i++) {
      const next = generator.next(GameMode.STATE_FLAGS, 27, last, all)
      expect(next.id).not.toBe(last.id)
    }
  })
})
