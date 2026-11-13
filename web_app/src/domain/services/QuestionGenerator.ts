import { GameMode, isMathMode, type MathGameMode } from '../entities/GameMode'
import type { Question } from '../entities/Question'
import { resolveDifficultyLevel } from './DifficultyLevelResolver'
import { questionsBelow, questionsFor, textQuestionsFor } from './QuestionCatalog'

/** Returns a number in [0, 1), like Math.random. Injected to make tests deterministic. */
export type RandomSource = () => number

/** Chance of drawing from the current level; the rest comes from the lower levels. */
export const CURRENT_LEVEL_PROBABILITY = 0.7

export class QuestionGenerator {
  private readonly random: RandomSource

  constructor(random: RandomSource = Math.random) {
    this.random = random
  }

  /**
   * Draws the next question, never repeating the previous one.
   * - Math: based on the current score; higher levels may also bring back questions from the lower levels.
   * - Text games: no question repeats until every one was shown (usedIds holds the ids already shown in the current round).
   */
  next(mode: GameMode, score: number, previous?: Question, usedIds: readonly string[] = []): Question {
    if (isMathMode(mode)) {
      return this.nextMath(mode, score, previous)
    }
    const all = textQuestionsFor(mode)
    const unused = all.filter((question) => !usedIds.includes(question.id))
    // Every question was shown: a new round starts with all of them again
    return this.pick(unused.length > 0 ? unused : all, previous)
  }

  private nextMath(mode: MathGameMode, score: number, previous?: Question): Question {
    const level = resolveDifficultyLevel(score)
    const lower = questionsBelow(mode, level)
    const fromLowerLevels = lower.length > 0 && this.random() >= CURRENT_LEVEL_PROBABILITY
    return this.pick(fromLowerLevels ? lower : questionsFor(mode, level), previous)
  }

  private pick<T extends Question>(questions: readonly T[], previous?: Question): T {
    const candidates = previous ? questions.filter((question) => question.id !== previous.id) : questions
    // Every pool has more than one question, but stay safe
    const pool = candidates.length > 0 ? candidates : questions
    const index = Math.min(pool.length - 1, Math.floor(this.random() * pool.length))
    return pool[index]
  }
}
