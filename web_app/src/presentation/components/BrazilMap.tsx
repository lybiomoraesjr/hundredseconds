import { messages } from '../i18n/messages'
import classes from './BrazilMap.module.css'
import { BRAZIL_MAP_STATES, BRAZIL_MAP_VIEW_BOX } from './brazilMapData'

/** States smaller than this (in viewBox units) get a ring around them, otherwise they are hard to spot (DF, SE, AL). */
const SMALL_STATE_SIZE = 50
const RING_PADDING = 12
/** Keeps the ring easy to see on phones even around the tiny Federal District. */
const MIN_RING_RADIUS = 30

interface BrazilMapProps {
  highlightedCode: string
  size?: 'md' | 'lg'
}

/** Map of Brazil with one state highlighted. Loaded lazily, only by the map game. */
export default function BrazilMap({ highlightedCode, size = 'md' }: BrazilMapProps) {
  const highlighted = BRAZIL_MAP_STATES.find((state) => state.code === highlightedCode)
  const [x, y, width, height] = highlighted?.box ?? [0, 0, 0, 0]
  const needsRing = highlighted !== undefined && Math.max(width, height) < SMALL_STATE_SIZE

  return (
    <svg
      className={`${classes.map} ${size === 'lg' ? classes.large : ''}`}
      viewBox={BRAZIL_MAP_VIEW_BOX}
      role="img"
      aria-label={messages.game.mapAlt}
      data-state={highlightedCode}
    >
      {BRAZIL_MAP_STATES.map((state) => (
        <path key={state.code} d={state.path}
          className={state.code === highlightedCode ? classes.highlighted : classes.state} />
      ))}
      {needsRing && (
        <circle className={classes.ring} cx={x + width / 2} cy={y + height / 2}
          r={Math.max(Math.max(width, height) / 2 + RING_PADDING, MIN_RING_RADIUS)} />
      )}
    </svg>
  )
}
