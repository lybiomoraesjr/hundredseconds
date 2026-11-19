import {
  chooseRuler,
  GameRules,
  isRulersQuizOver,
  nextRulersQuestion,
  startRulersQuiz,
  type RulersGameMode,
  type RulersQuiz,
} from '../../domain'

export type RulersQuizStatus = 'COUNTDOWN' | 'PLAYING' | 'FINISHED'

export interface RulersQuizState {
  readonly status: RulersQuizStatus
  /** 3, 2, 1 while counting down. */
  readonly countdown: number
  readonly quiz: RulersQuiz
  readonly startedAtMs: number | null
  /** Time since the start; frozen when the last question is done. */
  readonly elapsedMs: number
}

export type RulersQuizAction =
  | { type: 'COUNTDOWN_TICK' }
  | { type: 'START_PLAYING'; nowMs: number }
  | { type: 'TIMER_TICK'; nowMs: number }
  | { type: 'CHOOSE'; name: string }
  /** The feedback of the choice was shown: next question, or the end after the last one. */
  | { type: 'NEXT'; nowMs: number }

export function createInitialRulersQuizState(mode: RulersGameMode, random: () => number): RulersQuizState {
  return {
    status: 'COUNTDOWN',
    countdown: GameRules.COUNTDOWN_FROM,
    quiz: startRulersQuiz(mode, random),
    startedAtMs: null,
    elapsedMs: 0,
  }
}

const elapsedSince = (startedAtMs: number, nowMs: number) => Math.max(0, nowMs - startedAtMs)

export function rulersQuizReducer(state: RulersQuizState, action: RulersQuizAction): RulersQuizState {
  switch (action.type) {
    case 'COUNTDOWN_TICK':
      if (state.status !== 'COUNTDOWN' || state.countdown <= 1) return state
      return { ...state, countdown: state.countdown - 1 }

    case 'START_PLAYING':
      if (state.status !== 'COUNTDOWN') return state
      return { ...state, status: 'PLAYING', startedAtMs: action.nowMs }

    case 'TIMER_TICK':
      if (state.status !== 'PLAYING' || state.startedAtMs === null) return state
      return { ...state, elapsedMs: elapsedSince(state.startedAtMs, action.nowMs) }

    case 'CHOOSE':
      if (state.status !== 'PLAYING') return state
      return { ...state, quiz: chooseRuler(state.quiz, action.name) }

    case 'NEXT': {
      if (state.status !== 'PLAYING' || state.startedAtMs === null || state.quiz.chosen === null) return state
      const quiz = nextRulersQuestion(state.quiz)
      const elapsedMs = elapsedSince(state.startedAtMs, action.nowMs)
      return { ...state, quiz, elapsedMs, status: isRulersQuizOver(quiz) ? 'FINISHED' : 'PLAYING' }
    }
  }
}
