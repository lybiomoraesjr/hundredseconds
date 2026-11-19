import { describe, expect, it } from 'vitest'
import { messages } from './messages'

describe('formatDuration', () => {
  it('shows minutes, seconds and tenths', () => {
    expect(messages.formatDuration(0)).toBe('0:00,0')
    expect(messages.formatDuration(42_370)).toBe('0:42,3')
    expect(messages.formatDuration(185_100)).toBe('3:05,1')
  })

  it('names the rulers eras together with the game', () => {
    expect(messages.modeTitle('RULERS_EMPIRE')).toBe('Governantes: Império')
    expect(messages.modeTitle('STATE_FLAGS')).toBe('Bandeiras')
  })
})
