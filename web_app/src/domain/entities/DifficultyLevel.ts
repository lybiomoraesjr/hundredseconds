export const DifficultyLevel = {
  EASY: 'EASY',
  MEDIUM: 'MEDIUM',
  ADVANCED: 'ADVANCED',
} as const

export type DifficultyLevel = (typeof DifficultyLevel)[keyof typeof DifficultyLevel]
