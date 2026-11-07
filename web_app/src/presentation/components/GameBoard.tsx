import type { ReactNode } from 'react'
import classes from './GameBoard.module.css'

export function GameBoard({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  return (
    <section className={classes.board}>
      <div className={classes.content}>{children}</div>
      {footer}
    </section>
  )
}
