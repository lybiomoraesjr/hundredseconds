import { describe, expect, it } from 'vitest'
import { QuestionGenerator } from '../services/QuestionGenerator'
import { GameMode } from './GameMode'
import { finishReveal, startSession, starsOf, submitAnswer, type GameSession } from './GameSession'

const generator = new QuestionGenerator()

const answerOf = (session: GameSession) => String(session.currentQuestion.answer)
const wrongAnswerOf = (session: GameSession) => String(Number(session.currentQuestion.answer) + 1)

describe('GameSession', () => {
  it('starts with zero score, zero mistakes and the first attempt', () => {
    const session = startSession(GameMode.EXPONENTIATION, generator)

    expect(session).toMatchObject({ score: 0, wrongAnswers: 0, attempt: 1, phase: 'ANSWERING' })
    expect(session.currentQuestion.mode).toBe(GameMode.EXPONENTIATION)
  })

  it('scores a correct answer and moves to a different question', () => {
    const session = startSession(GameMode.ROOT_EXTRACTION, generator)

    const { session: next, outcome } = submitAnswer(session, answerOf(session), generator)

    expect(outcome).toBe('CORRECT')
    expect(next.score).toBe(1)
    expect(next.currentQuestion.id).not.toBe(session.currentQuestion.id)
  })

  it('allows a second attempt after the first mistake', () => {
    const session = startSession(GameMode.EXPONENTIATION, generator)

    const { session: retry, outcome } = submitAnswer(session, wrongAnswerOf(session), generator)

    expect(outcome).toBe('WRONG_RETRY')
    expect(retry).toMatchObject({ wrongAnswers: 1, attempt: 2, phase: 'ANSWERING', score: 0 })
    expect(retry.currentQuestion).toBe(session.currentQuestion)

    // Correct on the second try still scores and resets the attempt
    const { session: scored, outcome: second } = submitAnswer(retry, answerOf(retry), generator)
    expect(second).toBe('CORRECT')
    expect(scored).toMatchObject({ score: 1, wrongAnswers: 1, attempt: 1 })
  })

  it('reveals the answer after the second mistake and then draws a new question without scoring', () => {
    const session = startSession(GameMode.EXPONENTIATION, generator)
    const first = submitAnswer(session, wrongAnswerOf(session), generator).session

    const { session: revealing, outcome } = submitAnswer(first, wrongAnswerOf(first), generator)

    expect(outcome).toBe('WRONG_REVEAL')
    expect(revealing).toMatchObject({ wrongAnswers: 2, phase: 'REVEALING_ANSWER', score: 0 })
    expect(revealing.currentQuestion).toBe(session.currentQuestion)

    const next = finishReveal(revealing, generator)
    expect(next).toMatchObject({ phase: 'ANSWERING', attempt: 1, score: 0, wrongAnswers: 2 })
    expect(next.currentQuestion.id).not.toBe(session.currentQuestion.id)
  })

  it('ignores answers while the correct answer is being revealed', () => {
    const session = startSession(GameMode.EXPONENTIATION, generator)
    const first = submitAnswer(session, wrongAnswerOf(session), generator).session
    const revealing = submitAnswer(first, wrongAnswerOf(first), generator).session

    const result = submitAnswer(revealing, answerOf(revealing), generator)

    expect(result.outcome).toBe('IGNORED')
    expect(result.session).toBe(revealing)
  })

  it.each(['', '   ', 'abc'])('ignores empty or invalid input %j without counting a mistake', (input) => {
    const session = startSession(GameMode.EXPONENTIATION, generator)

    const result = submitAnswer(session, input, generator)

    expect(result.outcome).toBe('IGNORED')
    expect(result.session.wrongAnswers).toBe(0)
  })

  it('finishReveal does nothing while answering', () => {
    const session = startSession(GameMode.EXPONENTIATION, generator)
    expect(finishReveal(session, generator)).toBe(session)
  })

  it('earns one star every ten correct answers', () => {
    let session = startSession(GameMode.ROOT_EXTRACTION, generator)
    for (let i = 0; i < 23; i++) {
      session = submitAnswer(session, answerOf(session), generator).session
    }
    expect(session.score).toBe(23)
    expect(starsOf(session)).toBe(2)
  })
})

describe('GameSession with flags', () => {
  it('allows one more try after the first mistake and reveals the answer after the second', () => {
    const session = startSession(GameMode.STATE_FLAGS, generator)
    const first = submitAnswer(session, 'Atlântida', generator)
    expect(first.outcome).toBe('WRONG_RETRY')
    expect(first.session.phase).toBe('ANSWERING')
    expect(first.session.currentQuestion).toBe(session.currentQuestion)

    const second = submitAnswer(first.session, 'Atlântida', generator)
    expect(second.outcome).toBe('WRONG_REVEAL')
    expect(second.session.phase).toBe('REVEALING_ANSWER')
    expect(second.session.wrongAnswers).toBe(2)
  })

  it('accepts the state name without accents', () => {
    const session = startSession(GameMode.STATE_FLAGS, generator)
    const typed = String(session.currentQuestion.answer).normalize('NFD').replace(/\p{Diacritic}/gu, '').toUpperCase()
    const { session: next, outcome } = submitAnswer(session, typed, generator)
    expect(outcome).toBe('CORRECT')
    expect(next.score).toBe(1)
  })

  it('goes through the 27 flags before starting a new round', () => {
    let session = startSession(GameMode.STATE_FLAGS, generator)
    const shown = [session.currentQuestion.id]
    for (let i = 1; i < 27; i++) {
      session = submitAnswer(session, answerOf(session), generator).session
      shown.push(session.currentQuestion.id)
    }
    expect(new Set(shown).size).toBe(27)
    expect(session.usedQuestionIds).toHaveLength(27)

    const lastOfRound = session.currentQuestion.id
    session = submitAnswer(session, answerOf(session), generator).session
    expect(session.currentQuestion.id).not.toBe(lastOfRound)
    expect(session.usedQuestionIds).toEqual([session.currentQuestion.id])
  })

  it('keeps the round going after a revealed answer', () => {
    let session = startSession(GameMode.STATE_FLAGS, generator)
    const first = session.currentQuestion.id
    session = submitAnswer(session, 'errado', generator).session
    session = submitAnswer(session, 'errado', generator).session
    session = finishReveal(session, generator)
    expect(session.currentQuestion.id).not.toBe(first)
    expect(session.usedQuestionIds).toEqual([first, session.currentQuestion.id])
  })
})
