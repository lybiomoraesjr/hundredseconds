/** Tabs of the highscores screen; values match the API contract. */
export const LeaderboardPeriod = {
  USER: 'USER',
  DAY: 'DAY',
  WEEK: 'WEEK',
  YEAR: 'YEAR',
} as const

export type LeaderboardPeriod = (typeof LeaderboardPeriod)[keyof typeof LeaderboardPeriod]
