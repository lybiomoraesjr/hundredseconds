import { GameRules } from '../entities/GameRules'

/** One star every 10 correct answers, up to 10 stars. */
export function starsFor(score: number): number {
  if (score < 0) {
    throw new RangeError('score must not be negative')
  }
  return Math.min(GameRules.MAX_STARS, Math.floor(score / GameRules.ANSWERS_PER_STAR))
}
