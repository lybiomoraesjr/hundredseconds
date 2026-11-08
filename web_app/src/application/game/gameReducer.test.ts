import { describe, expect, it } from 'vitest'
import { GameMode, QuestionGenerator } from '../../domain'
import { createGameReducer, createInitialGameState, type GameState } from './gameReducer'

const generator = new QuestionGenerator()
const reduce = createGameReducer(generator)
const START = 1_000_000

const playing = (): GameState =>
  reduce(createInitialGameState(GameMode.EXPONENTIATION, generator), { type: 'START_PLAYING', nowMs: START })

const wrong = (state: GameState) => String(Number(state.session.currentQuestion.answer) + 1)
const right = (state: GameState) => String(state.session.currentQuestion.answer)

describe('gameReducer', () => {
  it('counts down from 3 and then starts playing', () => {
    let state = createInitialGameState(GameMode.EXPONENTIATION, generator)
    expect(state).toMatchObject({ status: 'COUNTDOWN', countdown: 3, secondsLeft: 100 })

    state = reduce(state, { type: 'COUNTDOWN_TICK' })
    state = reduce(state, { type: 'COUNTDOWN_TICK' })
    expect(state.countdown).toBe(1)
    expect(reduce(state, { type: 'COUNTDOWN_TICK' }).countdown).toBe(1)

    state = reduce(state, { type: 'START_PLAYING', nowMs: START })
    expect(state).toMatchObject({ status: 'PLAYING', startedAtMs: START })
  })

  it('ignores answers during the countdown', () => {
    const state = createInitialGameState(GameMode.EXPONENTIATION, generator)
    expect(reduce(state, { type: 'SUBMIT', input: right(state) })).toBe(state)
  })

  it('updates the clock and finishes after 100 seconds', () => {
    let state = reduce(playing(), { type: 'TIMER_TICK', nowMs: START + 7_000 })
    expect(state).toMatchObject({ secondsLeft: 93, status: 'PLAYING' })
    expect(state.timeFraction).toBeCloseTo(0.93)

    state = reduce(state, { type: 'TIMER_TICK', nowMs: START + 100_000 })
    expect(state).toMatchObject({ secondsLeft: 0, status: 'FINISHED' })
  })

  it('ignores answers after the end', () => {
    const finished = reduce(playing(), { type: 'TIMER_TICK', nowMs: START + 100_000 })
    expect(reduce(finished, { type: 'SUBMIT', input: right(finished) })).toBe(finished)
  })

  it('tracks feedback for retries and reveals', () => {
    let state = playing()
    state = reduce(state, { type: 'SUBMIT', input: wrong(state) })
    expect(state).toMatchObject({ lastOutcome: 'WRONG_RETRY', mistakeCount: 1 })

    expect(reduce(state, { type: 'CLEAR_FEEDBACK' }).lastOutcome).toBeNull()

    state = reduce(state, { type: 'SUBMIT', input: wrong(state) })
    expect(state).toMatchObject({ lastOutcome: 'WRONG_REVEAL', mistakeCount: 2 })
    expect(state.session.phase).toBe('REVEALING_ANSWER')
    // Clearing feedback does not cancel the reveal
    expect(reduce(state, { type: 'CLEAR_FEEDBACK' })).toBe(state)

    state = reduce(state, { type: 'FINISH_REVEAL' })
    expect(state.session.phase).toBe('ANSWERING')
    expect(state.lastOutcome).toBeNull()
  })

  it('does not change state on empty input', () => {
    const state = playing()
    expect(reduce(state, { type: 'SUBMIT', input: '' })).toBe(state)
  })
})
