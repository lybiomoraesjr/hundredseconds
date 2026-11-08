import { describe, expect, it } from 'vitest'
import { GameMode, type StateGameMode } from '../entities/GameMode'
import { stateQuestionsFor } from './QuestionCatalog'
import { QuestionGenerator } from './QuestionGenerator'

const STATE_MODES: StateGameMode[] = [GameMode.STATE_FLAGS, GameMode.STATE_ABBREVIATIONS]

describe('QuestionGenerator with state games', () => {
  it('asks for the state name on flags and for the uppercase abbreviation on abbreviations', () => {
    const flag = stateQuestionsFor(GameMode.STATE_FLAGS).find((question) => question.stateCode === 'mg')
    const abbreviation = stateQuestionsFor(GameMode.STATE_ABBREVIATIONS).find((question) => question.stateCode === 'mg')
    expect(flag?.answer).toBe('Minas Gerais')
    expect(abbreviation?.answer).toBe('MG')
    expect(abbreviation?.stateName).toBe('Minas Gerais')
  })

  describe.each(STATE_MODES)('%s', (mode) => {
    it('has one question per state', () => {
      expect(stateQuestionsFor(mode)).toHaveLength(27)
    })

    it('shows every state once before repeating any of them', () => {
      const generator = new QuestionGenerator()
      const used: string[] = []
      let previous = generator.next(mode, 0)
      used.push(previous.id)
      for (let i = 1; i < 27; i++) {
        previous = generator.next(mode, i, previous, used)
        used.push(previous.id)
      }
      expect(new Set(used).size).toBe(27)
      expect(used.every((id) => stateQuestionsFor(mode).some((question) => question.id === id))).toBe(true)
    })

    it('starts a new round when every state was shown, never repeating the last one', () => {
      const generator = new QuestionGenerator(() => 0.999)
      const questions = stateQuestionsFor(mode)
      const all = questions.map((question) => question.id)
      const last = questions[questions.length - 1]
      for (let i = 0; i < 50; i++) {
        expect(generator.next(mode, 27, last, all).id).not.toBe(last.id)
      }
    })
  })
})
