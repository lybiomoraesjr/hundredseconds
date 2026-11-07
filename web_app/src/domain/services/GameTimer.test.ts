import { describe, expect, it } from 'vitest'
import { remainingFraction, remainingSeconds, shouldPlayWarning } from './GameTimer'

describe('GameTimer', () => {
  const start = 1_000_000

  it('counts down whole seconds from 100 to 0', () => {
    expect(remainingSeconds(start, start)).toBe(100)
    expect(remainingSeconds(start, start + 500)).toBe(100)
    expect(remainingSeconds(start, start + 1000)).toBe(99)
    expect(remainingSeconds(start, start + 7_000)).toBe(93)
    expect(remainingSeconds(start, start + 99_999)).toBe(1)
    expect(remainingSeconds(start, start + 100_000)).toBe(0)
    expect(remainingSeconds(start, start + 150_000)).toBe(0)
  })

  it('computes the progress bar fraction', () => {
    expect(remainingFraction(start, start)).toBe(1)
    expect(remainingFraction(start, start + 25_000)).toBeCloseTo(0.75)
    expect(remainingFraction(start, start + 200_000)).toBe(0)
  })

  it('plays the warning only once, when reaching ten seconds left', () => {
    const ticks = [100, 50, 12, 11, 10, 9, 5, 1, 0]
    const warnings = ticks.slice(1).filter((seconds, index) => shouldPlayWarning(ticks[index], seconds))
    expect(warnings).toEqual([10])
  })

  it('still plays the warning when the tick at ten seconds is skipped', () => {
    expect(shouldPlayWarning(11, 9)).toBe(true)
    expect(shouldPlayWarning(10, 9)).toBe(false)
  })
})
