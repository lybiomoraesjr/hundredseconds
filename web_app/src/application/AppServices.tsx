import { createContext, use, type ReactNode } from 'react'
import { QuestionGenerator } from '../domain'
import type { SessionStore } from './auth/SessionStore'
import type { AuthGateway } from './ports/AuthGateway'
import type { Beeper } from './ports/Beeper'
import type { ScoreGateway } from './ports/ScoreGateway'

/** Dependencies injected into the UI, replaceable in tests. */
export interface AppServices {
  readonly scoreGateway: ScoreGateway
  readonly authGateway: AuthGateway
  readonly sessionStore: SessionStore
  readonly beeper: Beeper
  readonly questionGenerator: QuestionGenerator
  /** Current time in milliseconds, like Date.now. */
  readonly now: () => number
}

const AppServicesContext = createContext<AppServices | null>(null)

export function AppServicesProvider({ services, children }: { services: AppServices; children: ReactNode }) {
  return <AppServicesContext value={services}>{children}</AppServicesContext>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAppServices(): AppServices {
  const services = use(AppServicesContext)
  if (!services) {
    throw new Error('useAppServices must be used inside AppServicesProvider')
  }
  return services
}
