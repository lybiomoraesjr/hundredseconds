import { describe, expect, it } from 'vitest'
import { GameMode } from '../../domain'
import { GAME_MODE_GROUPS } from './gameModeGroups'

describe('GAME_MODE_GROUPS', () => {
  it('lists every game mode exactly once', () => {
    const listed = GAME_MODE_GROUPS.flatMap((group) => group.modes)
    expect([...listed].sort()).toEqual(Object.values(GameMode).sort())
  })
})
