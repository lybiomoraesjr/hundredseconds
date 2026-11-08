import { GameMode } from '../entities/GameMode'
import type { Question } from '../entities/Question'
import { parseAnswer } from './AnswerParser'

/** EMPTY means there is nothing to check (blank or invalid input) and must not count as a mistake. */
export type AnswerCheck = 'EMPTY' | 'CORRECT' | 'WRONG'

/**
 * Makes typed names comparable: case, accents and extra spaces are ignored
 * ("  sao   PAULO " matches "São Paulo").
 */
export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

export function checkAnswer(question: Question, input: string): AnswerCheck {
  if (question.mode === GameMode.STATE_FLAGS) {
    const typed = normalizeText(input)
    if (typed === '') return 'EMPTY'
    return typed === normalizeText(question.answer) ? 'CORRECT' : 'WRONG'
  }
  const answer = parseAnswer(input)
  if (answer === null) return 'EMPTY'
  return answer === question.answer ? 'CORRECT' : 'WRONG'
}
