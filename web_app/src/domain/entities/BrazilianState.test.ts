import { describe, expect, it } from 'vitest'
import { BRAZILIAN_STATES } from './BrazilianState'

// Lists the files in public/flags without loading them
const flagFiles = Object.keys(import.meta.glob('../../../public/flags/*.webp'))
  .map((path) => path.split('/').pop())

describe('BRAZILIAN_STATES', () => {
  it('has the 26 states and the Federal District, without duplicates', () => {
    expect(BRAZILIAN_STATES).toHaveLength(27)
    expect(new Set(BRAZILIAN_STATES.map((state) => state.code)).size).toBe(27)
    expect(new Set(BRAZILIAN_STATES.map((state) => state.name)).size).toBe(27)
  })

  it('uses lowercase two-letter codes', () => {
    for (const state of BRAZILIAN_STATES) {
      expect(state.code).toMatch(/^[a-z]{2}$/)
    }
  })

  it('has no flag image left without a state', () => {
    expect(flagFiles).toHaveLength(BRAZILIAN_STATES.length)
  })

  it.each(BRAZILIAN_STATES.map((state) => state.code))('has a flag image for %s', (code) => {
    expect(flagFiles).toContain(`${code}.webp`)
  })
})
