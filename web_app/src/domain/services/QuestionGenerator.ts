import type { GameMode } from '../entities/GameMode'
import type { Question } from '../entities/Question'
import { resolveDifficultyLevel } from './DifficultyLevelResolver'
import { questionsFor } from './QuestionCatalog'

/** Returns a number in [0, 1), like Math.random. Injected to make tests deterministic. */
export type RandomSource = () => number

export class QuestionGenerator {
  private readonly random: RandomSource

  constructor(random: RandomSource = Math.random) {
    this.random = random
  }

  /**
   * Draws a question for the current score, never repeating the previous one.
   */
  next(mode: GameMode, score: number, previous?: Question): Question {
    const all = questionsFor(mode, resolveDifficultyLevel(score))
    const candidates = previous ? all.filter((question) => question.id !== previous.id) : all
    // A level always has more than one question, but stay safe
    const pool = candidates.length > 0 ? candidates : all
    const index = Math.min(pool.length - 1, Math.floor(this.random() * pool.length))
    return pool[index]
  }
}
