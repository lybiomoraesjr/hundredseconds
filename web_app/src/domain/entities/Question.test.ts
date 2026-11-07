import { describe, expect, it } from 'vitest'
import { GameMode } from './GameMode'
import { createPowerQuestion, createRootQuestion } from './Question'

describe('Question', () => {
  it('creates power questions with the computed answer', () => {
    expect(createPowerQuestion(2, 10)).toEqual({
      id: 'pow:2^10',
      mode: GameMode.EXPONENTIATION,
      operand: 2,
      degree: 10,
      answer: 1024,
    })
    expect(createPowerQuestion(7, 0).answer).toBe(1)
  })

  it('creates exact root questions', () => {
    expect(createRootQuestion(243, 5)).toMatchObject({ id: 'root:5:243', answer: 3 })
    expect(createRootQuestion(1000, 3).answer).toBe(10)
    expect(createRootQuestion(0, 2).answer).toBe(0)
  })

  it('refuses non exact roots', () => {
    expect(() => createRootQuestion(50, 2)).toThrow()
  })
})
