import { isTextQuestion, type Question } from '../entities/Question'
import { parseAnswer } from './AnswerParser'

/** EMPTY means there is nothing to check (blank or invalid input) and must not count as a mistake. */
export type AnswerCheck = 'EMPTY' | 'CORRECT' | 'WRONG'

/**
 * Makes typed text comparable: case, accents and extra spaces are ignored
 * ("  sao   PAULO " matches "São Paulo", "mg" matches "MG").
 */
export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

/** Hyphens and spaces are ignored too ("belo horizontino" and "belohorizontino" match "belo-horizontino"). */
function comparable(text: string): string {
  return normalizeText(text).replace(/[\s-]/g, '')
}

export function checkAnswer(question: Question, input: string): AnswerCheck {
  if (isTextQuestion(question)) {
    const typed = comparable(input)
    if (typed === '') return 'EMPTY'
    return question.acceptedAnswers.some((accepted) => comparable(accepted) === typed) ? 'CORRECT' : 'WRONG'
  }
  const answer = parseAnswer(input)
  if (answer === null) return 'EMPTY'
  return answer === question.answer ? 'CORRECT' : 'WRONG'
}
