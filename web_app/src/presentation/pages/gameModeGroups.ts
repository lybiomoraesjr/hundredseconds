import { GameMode } from '../../domain'
import { messages } from '../i18n/messages'

/** How the games are grouped on the home page. Every game mode must appear exactly once. */
export const GAME_MODE_GROUPS: ReadonlyArray<{ readonly label: string; readonly modes: readonly GameMode[] }> = [
  { label: messages.modeGroups.math, modes: [GameMode.EXPONENTIATION, GameMode.ROOT_EXTRACTION] },
  {
    label: messages.modeGroups.geography,
    modes: [
      GameMode.STATE_FLAGS,
      GameMode.STATE_MAP,
      GameMode.STATE_ABBREVIATIONS,
      GameMode.STATE_CAPITALS,
      GameMode.STATE_DEMONYMS,
      GameMode.CAPITAL_DEMONYMS,
    ],
  },
  { label: messages.modeGroups.history, modes: [GameMode.BRAZIL_RULERS] },
]
