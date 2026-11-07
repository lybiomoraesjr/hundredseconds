/** Game modes; values match the API contract. */
export const GameMode = {
  EXPONENTIATION: 'EXPONENTIATION',
  ROOT_EXTRACTION: 'ROOT_EXTRACTION',
} as const

export type GameMode = (typeof GameMode)[keyof typeof GameMode]
