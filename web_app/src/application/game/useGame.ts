import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { revealDurationFor, shouldPlayWarning, starsFor, type GameMode } from '../../domain'
import { useAppServices } from '../AppServices'
import type { FinishedMatch } from '../ports/ScoreGateway'
import { createGameReducer, createInitialGameState } from './gameReducer'

const TIMER_INTERVAL_MS = 100
const COUNTDOWN_STEP_MS = 1000

/**
 * Runs a match: countdown (with sounds), 100 second timer, answer reveal delay, warning beep and end of game.
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

  // One beep for each countdown number (3, 2, 1). The ref prevents repeats when effects re-run (StrictMode)
  const lastCountdownBeep = useRef<number | null>(null)
  useEffect(() => {
    if (status !== 'COUNTDOWN' || lastCountdownBeep.current === countdown) return
    lastCountdownBeep.current = countdown
    beeper.countdownTick()
  }, [status, countdown, beeper])

  // Different sound when the match starts
  const startSoundPlayed = useRef(false)
  useEffect(() => {
    if (status !== 'PLAYING' || startSoundPlayed.current) return
    startSoundPlayed.current = true
    beeper.start()
  }, [status, beeper])

  // Game clock (time is always computed from the start instant, so drift does not accumulate)
  useEffect(() => {
    if (status !== 'PLAYING') return
    const interval = setInterval(() => dispatch({ type: 'TIMER_TICK', nowMs: now() }), TIMER_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [status, now])

  // Correct answer stays on screen for a moment after the last mistake.
  // The game clock keeps running meanwhile, so the player really loses that time.
  useEffect(() => {
    if (phase !== 'REVEALING_ANSWER' || status !== 'PLAYING') return
    const timeout = setTimeout(() => dispatch({ type: 'FINISH_REVEAL' }), revealDurationFor(mode))
    return () => clearTimeout(timeout)
  }, [phase, status, state.session.wrongAnswers, mode])

  // Single warning beep at 10 seconds left
  const previousSecondsLeft = useRef(secondsLeft)
  useEffect(() => {
    if (shouldPlayWarning(previousSecondsLeft.current, secondsLeft)) {
      beeper.warning()
    }
    previousSecondsLeft.current = secondsLeft
  }, [secondsLeft, beeper])

  // Chime each time a new star is earned (no more after the 10th star)
  const stars = starsFor(state.session.score)
  const previousStars = useRef(stars)
  useEffect(() => {
    if (stars > previousStars.current) {
      beeper.star()
    }
    previousStars.current = stars
  }, [stars, beeper])

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

  return { state, stars, submit, clearFeedback }
}
