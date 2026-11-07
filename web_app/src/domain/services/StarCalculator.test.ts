import { describe, expect, it } from 'vitest'
import { starsFor } from './StarCalculator'

describe('starsFor', () => {
  it.each([
    [0, 0], [9, 0], [10, 1], [25, 2], [99, 9], [100, 10], [150, 10],
  ])('score %i gives %i stars', (score, stars) => {
    expect(starsFor(score)).toBe(stars)
  })

  it('rejects negative scores', () => {
    expect(() => starsFor(-1)).toThrow(RangeError)
  })
})
