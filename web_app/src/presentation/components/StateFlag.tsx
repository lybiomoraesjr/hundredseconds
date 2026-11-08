import { messages } from '../i18n/messages'
import { flagUrl } from './flagImages'
import classes from './StateFlag.module.css'

export function StateFlag({ stateCode, size = 'md' }: { stateCode: string; size?: 'md' | 'lg' }) {
  return (
    <img
      className={`${classes.flag} ${size === 'lg' ? classes.large : ''}`}
      src={flagUrl(stateCode)}
      alt={messages.game.flagAlt}
      data-state={stateCode}
      draggable={false}
    />
  )
}
