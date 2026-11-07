import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { GameRules, shouldPlayWarning, starsFor, type GameMode } from '../../domain'
import { useAppServices } from '../AppServices'
import type { FinishedMatch } from '../ports/ScoreGateway'
import { createGameReducer, createInitialGameState } from './gameReducer'

const TIMER_INTERVAL_MS = 100
const COUNTDOWN_STEP_MS = 1000

/**
 * Runs a match: countdown, 100 second timer, answer reveal delay, warning beep and end of game.
 */
export function useGame(mode: GameMode, onFinished: (match: FinishedMatch) => void) {
  const { questionGenerator, beeper, now } = useAppServices()
  const reducer = useMemo(() => createGameReducer(questionGenerator), [questionGenerator])
  const [state, dispatch] = useReducer(reducer, undefined, () => createInitialGameState(mode, questionGenerator))

  const { status, countdown, secondsLeft } = state
  const phase = state.session.phase

  // Countdown 3 -> 2 -> 1 -> play
  useEffect(() => {
    if (status !== 'COUNTDOWN') return
    const timeout = setTimeout(() => {
      dispatch(countdown > 1 ? { type: 'COUNTDOWN_TICK' } : { type: 'START_PLAYING', nowMs: now() })
    }, COUNTDOWN_STEP_MS)
    return () => clearTimeout(timeout)
  }, [status, countdown, now])

  // Game clock (time is always computed from the start instant, so drift does not accumulate)
  useEffect(() => {
    if (status !== 'PLAYING') return
    const interval = setInterval(() => dispatch({ type: 'TIMER_TICK', nowMs: now() }), TIMER_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [status, now])

  // Correct answer stays on screen for one second after the second mistake
  useEffect(() => {
    if (phase !== 'REVEALING_ANSWER' || status !== 'PLAYING') return
    const timeout = setTimeout(() => dispatch({ type: 'FINISH_REVEAL' }), GameRules.REVEAL_DURATION_MS)
    return () => clearTimeout(timeout)
  }, [phase, status, state.session.wrongAnswers])

  // Single warning beep at 10 seconds left
  const previousSecondsLeft = useRef(secondsLeft)
  useEffect(() => {
    if (shouldPlayWarning(previousSecondsLeft.current, secondsLeft)) {
      beeper.beep()
    }
    previousSecondsLeft.current = secondsLeft
  }, [secondsLeft, beeper])

  // Notify the end of the match exactly once
  const onFinishedRef = useRef(onFinished)
  useEffect(() => {
    onFinishedRef.current = onFinished
  }, [onFinished])
  const finishedNotified = useRef(false)
  useEffect(() => {
    if (status !== 'FINISHED' || finishedNotified.current) return
    finishedNotified.current = true
    onFinishedRef.current({ mode, score: state.session.score, wrongAnswers: state.session.wrongAnswers })
  }, [status, mode, state.session.score, state.session.wrongAnswers])

  const submit = useCallback((input: string) => dispatch({ type: 'SUBMIT', input }), [])
  const clearFeedback = useCallback(() => dispatch({ type: 'CLEAR_FEEDBACK' }), [])

  return { state, stars: starsFor(state.session.score), submit, clearFeedback }
}
