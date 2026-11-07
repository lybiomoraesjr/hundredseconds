import { GameRules } from '../../domain'
import { messages } from '../i18n/messages'
import classes from './StarBar.module.css'

const STAR_PATH = 'M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.2l7.1-.6z'

export function StarBar({ stars }: { stars: number }) {
  return (
    <div className={classes.bar} role="img" aria-label={messages.game.starsLabel(stars)}>
      {Array.from({ length: GameRules.MAX_STARS }, (_, index) => (
        <svg key={index} viewBox="0 0 24 24" strokeWidth={1.2} aria-hidden="true"
          className={`${classes.star} ${index < stars ? classes.filled : classes.empty}`}
          data-filled={index < stars}>
          <path d={STAR_PATH} />
        </svg>
      ))}
    </div>
  )
}
