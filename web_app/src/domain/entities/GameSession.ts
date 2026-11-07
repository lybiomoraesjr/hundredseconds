import type { GameMode } from './GameMode'
import { GameRules } from './GameRules'
import type { Question } from './Question'
import { parseAnswer } from '../services/AnswerParser'
import type { QuestionGenerator } from '../services/QuestionGenerator'
import { starsFor } from '../services/StarCalculator'

/**
 * - ANSWERING: input box visible, waiting for an answer
 * - REVEALING_ANSWER: second mistake, the correct answer covers the screen
 */
export type SessionPhase = 'ANSWERING' | 'REVEALING_ANSWER'

export interface GameSession {
  readonly mode: GameMode
  readonly score: number
  readonly wrongAnswers: number
  readonly currentQuestion: Question
  /** 1 on the first try, 2 after one mistake. */
  readonly attempt: number
  readonly phase: SessionPhase
}

export type SubmitOutcome =
  /** Empty/invalid input or submitted while revealing: nothing changes. */
  | 'IGNORED'
  | 'CORRECT'
  /** First mistake: red border, try again. */
  | 'WRONG_RETRY'
  /** Second mistake: reveal the answer, then move on. */
  | 'WRONG_REVEAL'

export interface SubmitResult {
  readonly session: GameSession
  readonly outcome: SubmitOutcome
}

export function startSession(mode: GameMode, generator: QuestionGenerator): GameSession {
  return {
    mode,
    score: 0,
    wrongAnswers: 0,
    currentQuestion: generator.next(mode, 0),
    attempt: 1,
    phase: 'ANSWERING',
  }
}

export function submitAnswer(session: GameSession, input: string,
  generator: QuestionGenerator): SubmitResult {
  const answer = parseAnswer(input)
  if (session.phase !== 'ANSWERING' || answer === null) {
    return { session, outcome: 'IGNORED' }
  }

  if (answer === session.currentQuestion.answer) {
    const score = session.score + 1
    return {
      outcome: 'CORRECT',
      session: {
        ...session,
        score,
        attempt: 1,
        currentQuestion: generator.next(session.mode, score, session.currentQuestion),
      },
    }
  }

  const wrongAnswers = session.wrongAnswers + 1
  if (session.attempt < GameRules.MAX_ATTEMPTS) {
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
  return {
    ...session,
    phase: 'ANSWERING',
    attempt: 1,
    currentQuestion: generator.next(session.mode, session.score, session.currentQuestion),
  }
}

export function starsOf(session: GameSession): number {
  return starsFor(session.score)
}
