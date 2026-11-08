import { GameMode, type MathQuestion } from '../../domain'
import { messages } from '../i18n/messages'
import classes from './MathExpression.module.css'

/** Renders a^n with <sup> and roots with a visible index and radicand (RNF04). */
export function MathExpression({ question }: { question: MathQuestion }) {
  if (question.mode === GameMode.EXPONENTIATION) {
    return (
      <span className={classes.expression} role="math" aria-label={messages.math.power(question.operand, question.degree)}>
        {question.operand}
        <sup className={classes.exponent}>{question.degree}</sup>
      </span>
    )
  }
  const hasIndex = question.degree > 2
  return (
    <span className={`${classes.expression} ${classes.root} ${hasIndex ? classes.withIndex : ''}`} role="math"
      aria-label={messages.math.root(question.operand, question.degree)}>
      {hasIndex && <sup className={classes.rootIndex}>{question.degree}</sup>}
      <svg className={classes.radicalSign} viewBox="0 0 55 100" preserveAspectRatio="none" aria-hidden="true">
        {/* Small tick, long descending stroke, then up to the top bar */}
        <path d="M2 58 L14 52 L26 96 L52 3.75 L56 3.75" vectorEffect="non-scaling-stroke" />
      </svg>
      <span className={classes.radicand}>{question.operand}</span>
    </span>
  )
}
