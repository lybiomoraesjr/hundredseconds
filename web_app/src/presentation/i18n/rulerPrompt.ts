import type { BrazilianRuler } from '../../domain'
import { messages } from './messages'

const yearOf = (isoDate: string) => isoDate.slice(0, 4)

/** "1831-04-07" -> "07/04/1831" */
const fullDate = (isoDate: string) => {
  const [year, month, day] = isoDate.split('-')
  return `${day}/${month}/${year}`
}

/** Question shown above the prompt. */
export function rulerHeading(ruler: BrazilianRuler): string {
  return ruler.kind === 'GOVERNED' ? messages.game.rulerQuestion : messages.game.notInauguratedQuestion
}

/**
 * The period asked: years only ("1930 a 1945"), or full dates when the term started and ended
 * in the same year, since years alone would not tell those rulers apart (1955, 1961, 1964...).
 */
export function rulerPrompt(ruler: BrazilianRuler): string {
  if (ruler.kind === 'NOT_INAUGURATED') return String(ruler.electionYear)
  if (ruler.end === null) return messages.history.sinceUntilToday(yearOf(ruler.start))
  if (yearOf(ruler.start) === yearOf(ruler.end)) {
    return messages.history.period(fullDate(ruler.start), fullDate(ruler.end))
  }
  return messages.history.period(yearOf(ruler.start), yearOf(ruler.end))
}
