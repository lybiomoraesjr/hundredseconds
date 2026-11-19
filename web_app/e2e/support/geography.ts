import { expect, type Page } from '@playwright/test'
import { BRAZILIAN_STATES, type BrazilianState } from '../../src/domain/entities/BrazilianState'

/** A geography game as the player sees it, and how to find the answer of the question on screen. */
export interface GeographyGame {
  /** Chip label on the home page. */
  readonly label: string
  readonly question: string
  /** Finds the state behind the current question. */
  readonly currentState: (page: Page) => Promise<BrazilianState>
  readonly answerOf: (state: BrazilianState) => string
}

const byCode = (code: string | null) => {
  const state = BRAZILIAN_STATES.find((candidate) => candidate.code === code)
  if (!state) throw new Error(`Unknown state code: ${code}`)
  return state
}

const byPrompt = (field: 'name' | 'capital') => async (page: Page) => {
  const prompt = await page.getByTestId('prompt').textContent()
  const state = BRAZILIAN_STATES.find((candidate) => candidate[field] === prompt)
  if (!state) throw new Error(`Unknown prompt: ${prompt}`)
  return state
}

const byImage = (name: string) => async (page: Page) =>
  byCode(await page.getByRole('img', { name }).getAttribute('data-state'))

export const GEOGRAPHY_GAMES: readonly GeographyGame[] = [
  {
    label: 'Bandeiras',
    question: 'De qual estado é esta bandeira?',
    currentState: byImage('Bandeira de um estado brasileiro'),
    answerOf: (state) => state.name,
  },
  {
    label: 'Estados',
    question: 'Qual é o estado destacado no mapa?',
    currentState: byImage('Mapa do Brasil com um estado destacado'),
    answerOf: (state) => state.name,
  },
  {
    label: 'Siglas',
    question: 'Qual é a sigla deste estado?',
    currentState: byPrompt('name'),
    answerOf: (state) => state.code.toUpperCase(),
  },
  {
    label: 'Capitais',
    question: 'Qual é a capital deste estado?',
    currentState: byPrompt('name'),
    answerOf: (state) => state.capital,
  },
  {
    label: 'Gentílicos (estados)',
    question: 'Qual é o gentílico de quem nasce neste estado?',
    currentState: byPrompt('name'),
    answerOf: (state) => state.stateDemonyms[0],
  },
  {
    label: 'Gentílicos (capitais)',
    question: 'Qual é o gentílico de quem nasce nesta capital?',
    currentState: byPrompt('capital'),
    answerOf: (state) => state.capitalDemonyms[0],
  },
]

export async function answerGeographyCorrectly(page: Page, game: GeographyGame, times: number) {
  const input = page.getByLabel('Sua resposta')
  for (let i = 0; i < times; i++) {
    await input.fill(game.answerOf(await game.currentState(page)))
    await input.press('Enter')
    await expect(page.getByText(`Resultado: ${i + 1}`)).toBeVisible()
  }
}

/** Misses twice: after the second mistake the correct answer covers the screen for 1.5 s, then a new question shows up. */
export async function missGeographyQuestion(page: Page, game: GeographyGame) {
  const expected = game.answerOf(await game.currentState(page))
  const input = page.getByLabel('Sua resposta')
  // Digits are filtered out of abbreviations, so use letters that are never a state code
  await input.fill('XX')
  await input.press('Enter')
  await expect(page.getByText('Errou! Tente mais uma vez.')).toBeVisible()
  await input.fill('XX')
  await input.press('Enter')
  await expect(page.getByTestId('revealed-answer')).toHaveText(expected)
  await page.clock.runFor(1600)
  await expect(page.getByRole('alert')).toBeHidden()
}
