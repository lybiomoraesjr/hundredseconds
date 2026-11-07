import { MantineProvider } from '@mantine/core'
import { act, render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { vi } from 'vitest'
import { AppServicesProvider, type AppServices } from '../application/AppServices'
import type { ScoreGateway } from '../application/ports/ScoreGateway'
import { QuestionGenerator } from '../domain'
import { theme } from '../presentation/theme'

export function createFakeGateway(overrides: Partial<ScoreGateway> = {}): ScoreGateway {
  return {
    getSummary: vi.fn().mockResolvedValue({ personalBest: null, todayBest: null, yearBest: null }),
    getLeaderboard: vi.fn().mockResolvedValue([]),
    saveScore: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }
}

export function createServices(overrides: Partial<AppServices> = {}): AppServices {
  return {
    scoreGateway: createFakeGateway(),
    beeper: { unlock: vi.fn(), beep: vi.fn() },
    questionGenerator: new QuestionGenerator(),
    now: () => Date.now(),
    ...overrides,
  }
}

export function renderWithProviders(ui: ReactElement, services: AppServices = createServices()) {
  return {
    services,
    ...render(
      <MantineProvider theme={theme}>
        <AppServicesProvider services={services}>{ui}</AppServicesProvider>
      </MantineProvider>,
    ),
  }
}

/** Computes the answer of the question on screen from its accessible label. */
export function answerFromLabel(label: string): number {
  const power = /^(\d+) elevado a (\d+)$/.exec(label)
  if (power) return Number(power[1]) ** Number(power[2])
  const root = /^raiz (quadrada|cúbica|quarta|quinta) de (\d+)$/.exec(label)
  if (root) {
    const index = { quadrada: 2, 'cúbica': 3, quarta: 4, quinta: 5 }[root[1]]!
    return Math.round(Number(root[2]) ** (1 / index))
  }
  throw new Error(`Unknown label: ${label}`)
}

/**
 * Advances fake timers in small steps, letting React re-render (and re-schedule effects) between them.
 */
export async function advanceTime(ms: number, stepMs = 100): Promise<void> {
  for (let elapsed = 0; elapsed < ms; elapsed += stepMs) {
    await act(async () => {
      vi.advanceTimersByTime(Math.min(stepMs, ms - elapsed))
    })
  }
}
