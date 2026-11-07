import { describe, expect, it } from 'vitest'
import { remainingFraction, remainingSeconds, shouldBeep } from './GameTimer'

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

  it('beeps only during the last ten seconds', () => {
    expect(shouldBeep(11)).toBe(false)
    expect(shouldBeep(10)).toBe(true)
    expect(shouldBeep(1)).toBe(true)
    expect(shouldBeep(0)).toBe(true)
  })
})
