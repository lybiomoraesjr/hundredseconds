import { useCallback, useEffect, useReducer, useRef } from 'react'
import { GameRules, wasChoiceCorrect, type RulersGameMode } from '../../domain'
import { useAppServices } from '../AppServices'
import type { FinishedMatch } from '../ports/ScoreGateway'
import { createInitialRulersQuizState, rulersQuizReducer } from './rulersQuizReducer'

const TIMER_INTERVAL_MS = 100
const COUNTDOWN_STEP_MS = 1000

/**
 * Runs a rulers time trial: countdown (with sounds), a clock counting up, a short feedback after each choice
 * and the end of the match after the last ruler.
 */
export function useRulersQuiz(mode: RulersGameMode, onFinished: (match: FinishedMatch) => void) {
  const { beeper, now, random } = useAppServices()
  const [state, dispatch] = useReducer(rulersQuizReducer, undefined, () => createInitialRulersQuizState(mode, random))
  const { status, countdown, quiz } = state

  // Countdown 3 -> 2 -> 1 -> play
  useEffect(() => {
    if (status !== 'COUNTDOWN') return
    const timeout = setTimeout(() => {
      dispatch(countdown > 1 ? { type: 'COUNTDOWN_TICK' } : { type: 'START_PLAYING', nowMs: now() })
    }, COUNTDOWN_STEP_MS)
    return () => clearTimeout(timeout)
  }, [status, countdown, now])

  // One beep per countdown number; the ref prevents repeats when effects re-run (StrictMode)
  const lastCountdownBeep = useRef<number | null>(null)
  useEffect(() => {
    if (status !== 'COUNTDOWN' || lastCountdownBeep.current === countdown) return
    lastCountdownBeep.current = countdown
    beeper.countdownTick()
  }, [status, countdown, beeper])

  const startSoundPlayed = useRef(false)
  useEffect(() => {
    if (status !== 'PLAYING' || startSoundPlayed.current) return
    startSoundPlayed.current = true
    beeper.start()
  }, [status, beeper])

  // Clock counting up (always computed from the start instant, so drift does not accumulate)
  useEffect(() => {
    if (status !== 'PLAYING') return
    const interval = setInterval(() => dispatch({ type: 'TIMER_TICK', nowMs: now() }), TIMER_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [status, now])

  // After a choice, highlight the right answer for a moment, then move on (the clock keeps running)
  const hasChosen = quiz.chosen !== null
  const correct = wasChoiceCorrect(quiz)
  useEffect(() => {
    if (status !== 'PLAYING' || !hasChosen) return
    const delay = correct ? GameRules.RULERS_CORRECT_FEEDBACK_MS : GameRules.RULERS_WRONG_FEEDBACK_MS
    const timeout = setTimeout(() => dispatch({ type: 'NEXT', nowMs: now() }), delay)
    return () => clearTimeout(timeout)
  }, [status, hasChosen, correct, quiz.index, now])

  // Notify the end of the match exactly once
  const onFinishedRef = useRef(onFinished)
  useEffect(() => {
    onFinishedRef.current = onFinished
  }, [onFinished])
  const finishedNotified = useRef(false)
  useEffect(() => {
    if (status !== 'FINISHED' || finishedNotified.current) return
    finishedNotified.current = true
    onFinishedRef.current({
      mode,
      score: quiz.score,
      wrongAnswers: quiz.wrongAnswers,
      durationMs: Math.max(1, state.elapsedMs),
    })
  }, [status, mode, quiz.score, quiz.wrongAnswers, state.elapsedMs])

  const choose = useCallback((name: string) => dispatch({ type: 'CHOOSE', name }), [])

  return { state, choose }
}
