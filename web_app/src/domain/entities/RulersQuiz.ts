import { BRAZILIAN_RULERS, type BrazilianRuler } from './BrazilianRuler'
import { ERA_OF_RULERS_MODE, type RulersGameMode } from './GameMode'

/** Returns a number in [0, 1), like Math.random. */
type RandomSource = () => number

/** Choices per question: the right name and the wrong ones. */
export const OPTIONS_PER_QUESTION = 4
/** Wrong names are drawn among this many rulers closest in time, so they are believable. */
const NEARBY_NAMES = 6

export interface RulersQuizQuestion {
  readonly ruler: BrazilianRuler
  /** Names to choose from, in the order shown; exactly one is ruler.name. */
  readonly options: readonly string[]
}

/** A time trial: every question is asked once, in chronological order. */
export interface RulersQuiz {
  readonly mode: RulersGameMode
  readonly questions: readonly RulersQuizQuestion[]
  /** Position of the current question; equals questions.length when the quiz is over. */
  readonly index: number
  readonly score: number
  readonly wrongAnswers: number
  /** Name picked for the current question; null while waiting for the answer. */
  readonly chosen: string | null
}

function shuffled<T>(items: readonly T[], random: RandomSource): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.min(i, Math.floor(random() * (i + 1)))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/** Names of the rulers closest in time to the given one (excluding its own name), nearest first. */
function nearbyNames(ruler: BrazilianRuler): string[] {
  const position = BRAZILIAN_RULERS.indexOf(ruler)
  const byDistance = BRAZILIAN_RULERS
    .map((other, index) => ({ name: other.name, distance: Math.abs(index - position) }))
    .filter((other) => other.name !== ruler.name)
    .sort((a, b) => a.distance - b.distance)
  return [...new Set(byDistance.map((other) => other.name))]
}

export function optionsFor(ruler: BrazilianRuler, random: RandomSource): string[] {
  const wrong = shuffled(nearbyNames(ruler).slice(0, NEARBY_NAMES), random).slice(0, OPTIONS_PER_QUESTION - 1)
  return shuffled([ruler.name, ...wrong], random)
}

export function rulersOf(mode: RulersGameMode): readonly BrazilianRuler[] {
  const era = ERA_OF_RULERS_MODE[mode]
  return era === null ? BRAZILIAN_RULERS : BRAZILIAN_RULERS.filter((ruler) => ruler.era === era)
}

export function startRulersQuiz(mode: RulersGameMode, random: RandomSource = Math.random): RulersQuiz {
  const questions = rulersOf(mode).map((ruler) => ({ ruler, options: optionsFor(ruler, random) }))
  return { mode, questions, index: 0, score: 0, wrongAnswers: 0, chosen: null }
}

export function currentRulersQuestion(quiz: RulersQuiz): RulersQuizQuestion | null {
  return quiz.questions[quiz.index] ?? null
}

export function isRulersQuizOver(quiz: RulersQuiz): boolean {
  return quiz.index >= quiz.questions.length
}

/** One attempt per question: the choice is final. Ignored after a choice or when the quiz is over. */
export function chooseRuler(quiz: RulersQuiz, name: string): RulersQuiz {
  const question = currentRulersQuestion(quiz)
  if (!question || quiz.chosen !== null || !question.options.includes(name)) return quiz
  const correct = name === question.ruler.name
  return {
    ...quiz,
    chosen: name,
    score: correct ? quiz.score + 1 : quiz.score,
    wrongAnswers: correct ? quiz.wrongAnswers : quiz.wrongAnswers + 1,
  }
}

export function wasChoiceCorrect(quiz: RulersQuiz): boolean {
  const question = currentRulersQuestion(quiz)
  return question !== null && quiz.chosen === question.ruler.name
}

/** Moves on once the feedback of the choice was shown. */
export function nextRulersQuestion(quiz: RulersQuiz): RulersQuiz {
  if (quiz.chosen === null) return quiz
  return { ...quiz, index: quiz.index + 1, chosen: null }
}
