import { describe, expect, it } from 'vitest'
import { BRAZILIAN_RULERS } from './BrazilianRuler'
import { GameMode } from './GameMode'
import {
  chooseRuler,
  currentRulersQuestion,
  isRulersQuizOver,
  nextRulersQuestion,
  optionsFor,
  OPTIONS_PER_QUESTION,
  rulersOf,
  startRulersQuiz,
  wasChoiceCorrect,
} from './RulersQuiz'

const rulerById = (id: string) => BRAZILIAN_RULERS.find((ruler) => ruler.id === id)!

/** Deterministic pseudo-random sequence. */
function seeded(seed = 1) {
  let value = seed
  return () => {
    value = (value * 16807) % 2147483647
    return (value - 1) / 2147483646
  }
}

describe('rulers quiz', () => {
  it('asks every ruler of the era once, in chronological order', () => {
    const quiz = startRulersQuiz(GameMode.RULERS_EMPIRE, seeded())
    expect(quiz.questions.map((question) => question.ruler.name)).toEqual([
      'Dom Pedro I', 'Regência Trina Provisória', 'Regência Trina Permanente', 'Diogo Feijó', 'Araújo Lima',
      'Dom Pedro II',
    ])
    expect(rulersOf(GameMode.RULERS_ALL)).toHaveLength(BRAZILIAN_RULERS.length)
  })

  it('offers four different names: the right one and rulers close in time', () => {
    const random = seeded(7)
    for (const ruler of BRAZILIAN_RULERS) {
      const options = optionsFor(ruler, random)
      expect(options).toHaveLength(OPTIONS_PER_QUESTION)
      expect(new Set(options).size).toBe(OPTIONS_PER_QUESTION)
      expect(options.filter((option) => option === ruler.name)).toHaveLength(1)
    }
    // Tancredo's wrong options come from around 1985, never from the Empire
    const tancredo = optionsFor(rulerById('tancredo'), seeded(3))
    expect(tancredo).not.toContain('Dom Pedro I')
  })

  it('does not always put the right answer in the same place', () => {
    const random = seeded(11)
    const positions = new Set(Array.from({ length: 30 }, () =>
      optionsFor(rulerById('jk'), random).indexOf('Juscelino Kubitschek')))
    expect(positions.size).toBeGreaterThan(1)
  })

  it('scores right choices, counts wrong ones and ends after the last ruler', () => {
    let quiz = startRulersQuiz(GameMode.RULERS_MILITARY, seeded())
    const total = quiz.questions.length
    for (let i = 0; i < total; i++) {
      const question = currentRulersQuestion(quiz)!
      const wrong = question.options.find((option) => option !== question.ruler.name)!
      quiz = chooseRuler(quiz, i === 0 ? wrong : question.ruler.name)
      expect(wasChoiceCorrect(quiz)).toBe(i !== 0)
      quiz = nextRulersQuestion(quiz)
    }
    expect(isRulersQuizOver(quiz)).toBe(true)
    expect(currentRulersQuestion(quiz)).toBeNull()
    expect(quiz).toMatchObject({ score: total - 1, wrongAnswers: 1 })
  })

  it('keeps the first choice: a second click or an unknown name changes nothing', () => {
    const quiz = startRulersQuiz(GameMode.RULERS_EMPIRE, seeded())
    expect(chooseRuler(quiz, 'Ninguém')).toBe(quiz)
    const answered = chooseRuler(quiz, 'Dom Pedro I')
    expect(chooseRuler(answered, answered.questions[0].options.find((o) => o !== 'Dom Pedro I')!)).toBe(answered)
    expect(nextRulersQuestion(quiz)).toBe(quiz)
  })
})
