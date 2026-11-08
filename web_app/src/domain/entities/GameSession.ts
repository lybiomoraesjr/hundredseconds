import type { GameMode } from './GameMode'
import { maxAttemptsFor } from './GameRules'
import type { Question } from './Question'
import { checkAnswer } from '../services/AnswerChecker'
import type { QuestionGenerator } from '../services/QuestionGenerator'
import { starsFor } from '../services/StarCalculator'

/**
 * - ANSWERING: input box visible, waiting for an answer
 * - REVEALING_ANSWER: out of attempts, the correct answer covers the screen
 */
export type SessionPhase = 'ANSWERING' | 'REVEALING_ANSWER'

export interface GameSession {
  readonly mode: GameMode
  readonly score: number
  readonly wrongAnswers: number
  readonly currentQuestion: Question
  /** Ids shown in the current round (including the current question), so flags do not repeat too soon. */
  readonly usedQuestionIds: readonly string[]
  /** 1 on the first try, 2 after one mistake. */
  readonly attempt: number
  readonly phase: SessionPhase
}

export type SubmitOutcome =
  /** Empty/invalid input or submitted while revealing: nothing changes. */
  | 'IGNORED'
  | 'CORRECT'
  /** Mistake with attempts left: red border, try again. */
  | 'WRONG_RETRY'
  /** Mistake on the last attempt: reveal the answer, then move on. */
  | 'WRONG_REVEAL'

export interface SubmitResult {
  readonly session: GameSession
  readonly outcome: SubmitOutcome
}

export function startSession(mode: GameMode, generator: QuestionGenerator): GameSession {
  const firstQuestion = generator.next(mode, 0)
  return {
    mode,
    score: 0,
    wrongAnswers: 0,
    currentQuestion: firstQuestion,
    usedQuestionIds: [firstQuestion.id],
    attempt: 1,
    phase: 'ANSWERING',
  }
}

/** Moves to a new question. A question already used means the generator started a new round. */
function withNextQuestion(session: GameSession, score: number, generator: QuestionGenerator): GameSession {
  const next = generator.next(session.mode, score, session.currentQuestion, session.usedQuestionIds)
  const usedQuestionIds = session.usedQuestionIds.includes(next.id) ? [next.id] : [...session.usedQuestionIds, next.id]
  return { ...session, score, attempt: 1, phase: 'ANSWERING', currentQuestion: next, usedQuestionIds }
}

export function submitAnswer(session: GameSession, input: string,
  generator: QuestionGenerator): SubmitResult {
  if (session.phase !== 'ANSWERING') {
    return { session, outcome: 'IGNORED' }
  }
  const check = checkAnswer(session.currentQuestion, input)
  if (check === 'EMPTY') {
    return { session, outcome: 'IGNORED' }
  }

  if (check === 'CORRECT') {
    return { outcome: 'CORRECT', session: withNextQuestion(session, session.score + 1, generator) }
  }

  const wrongAnswers = session.wrongAnswers + 1
  if (session.attempt < maxAttemptsFor(session.mode)) {
    return {
      outcome: 'WRONG_RETRY',
      session: { ...session, wrongAnswers, attempt: session.attempt + 1 },
    }
  }
  return {
    outcome: 'WRONG_REVEAL',
    session: { ...session, wrongAnswers, phase: 'REVEALING_ANSWER' },
  }
}

/** Called when the reveal time is over: draws a new question without scoring. */
export function finishReveal(session: GameSession, generator: QuestionGenerator): GameSession {
  if (session.phase !== 'REVEALING_ANSWER') {
    return session
  }
  return withNextQuestion(session, session.score, generator)
}

export function starsOf(session: GameSession): number {
  return starsFor(session.score)
}
