import { describe, expect, it } from 'vitest'
import { parseAnswer } from './AnswerParser'

describe('parseAnswer', () => {
  it.each([
    ['8', 8], [' 64 ', 64], ['0', 0], ['007', 7], ['1024', 1024],
  ])('parses %j as %i', (input, expected) => {
    expect(parseAnswer(input)).toBe(expected)
  })

  it.each(['', '   ', '-1', '2.5', '1e3', 'abc', '8a'])('rejects %j', (input) => {
    expect(parseAnswer(input)).toBeNull()
  })
})
