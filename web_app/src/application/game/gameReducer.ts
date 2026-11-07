import {
  finishReveal,
  GameRules,
  remainingFraction,
  remainingSeconds,
  startSession,
  submitAnswer,
  type GameMode,
  type GameSession,
  type QuestionGenerator,
  type SubmitOutcome,
} from '../../domain'

export type GameStatus = 'COUNTDOWN' | 'PLAYING' | 'FINISHED'

export interface GameState {
  readonly status: GameStatus
  /** 3, 2, 1 while counting down. */
  readonly countdown: number
  readonly session: GameSession
  readonly startedAtMs: number | null
  readonly secondsLeft: number
  /** 1 (full bar) to 0 (empty bar). */
  readonly timeFraction: number
  readonly lastOutcome: SubmitOutcome | null
  /** Incremented on every mistake so the shake animation can restart. */
  readonly mistakeCount: number
}

export type GameAction =
  | { type: 'COUNTDOWN_TICK' }
  | { type: 'START_PLAYING'; nowMs: number }
  | { type: 'TIMER_TICK'; nowMs: number }
  | { type: 'SUBMIT'; input: string }
  | { type: 'FINISH_REVEAL' }
  | { type: 'CLEAR_FEEDBACK' }

export function createInitialGameState(mode: GameMode, generator: QuestionGenerator): GameState {
  return {
    status: 'COUNTDOWN',
    countdown: GameRules.COUNTDOWN_FROM,
    session: startSession(mode, generator),
    startedAtMs: null,
    secondsLeft: GameRules.DURATION_SECONDS,
    timeFraction: 1,
    lastOutcome: null,
    mistakeCount: 0,
  }
}

export function createGameReducer(generator: QuestionGenerator) {
  return function gameReducer(state: GameState, action: GameAction): GameState {
    switch (action.type) {
      case 'COUNTDOWN_TICK':
        if (state.status !== 'COUNTDOWN' || state.countdown <= 1) return state
        return { ...state, countdown: state.countdown - 1 }

      case 'START_PLAYING':
        if (state.status !== 'COUNTDOWN') return state
        return { ...state, status: 'PLAYING', startedAtMs: action.nowMs }

      case 'TIMER_TICK': {
        if (state.status !== 'PLAYING' || state.startedAtMs === null) return state
        const secondsLeft = remainingSeconds(state.startedAtMs, action.nowMs)
        const timeFraction = remainingFraction(state.startedAtMs, action.nowMs)
        return { ...state, secondsLeft, timeFraction, status: secondsLeft === 0 ? 'FINISHED' : 'PLAYING' }
      }

      case 'SUBMIT': {
        if (state.status !== 'PLAYING') return state
        const { session, outcome } = submitAnswer(state.session, action.input, generator)
        if (outcome === 'IGNORED') return state
        const isMistake = outcome === 'WRONG_RETRY' || outcome === 'WRONG_REVEAL'
        return {
          ...state,
          session,
          lastOutcome: outcome,
          mistakeCount: isMistake ? state.mistakeCount + 1 : state.mistakeCount,
        }
      }

      case 'FINISH_REVEAL':
        return { ...state, session: finishReveal(state.session, generator), lastOutcome: null }

      case 'CLEAR_FEEDBACK':
        return state.lastOutcome === 'WRONG_RETRY' ? { ...state, lastOutcome: null } : state
    }
  }
}
