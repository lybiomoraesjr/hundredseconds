import { expect, type Page } from '@playwright/test'

/** Unique suffix so tests can run repeatedly against the same database. */
export const uniqueTag = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`

/** Computes the answer of the question on screen from its accessible label. */
export async function currentAnswer(page: Page): Promise<number> {
  const label = (await page.getByRole('math').first().getAttribute('aria-label')) ?? ''
  const power = /^(\d+) elevado a (\d+)$/.exec(label)
  if (power) return Number(power[1]) ** Number(power[2])
  const root = /^raiz (quadrada|cúbica|quarta|quinta) de (\d+)$/.exec(label)
  if (!root) throw new Error(`Unexpected question label: ${label}`)
  const index = { quadrada: 2, 'cúbica': 3, quarta: 4, quinta: 5 }[root[1] as 'quadrada']
  return Math.round(Number(root[2]) ** (1 / index))
}

/** Opens the app with a controllable clock, so 100 seconds can pass instantly. */
export async function openGame(page: Page) {
  await page.clock.install()
  await page.goto('/')
  await expect(page.getByRole('heading', { name: '100 segundos' })).toBeVisible()
}

/** Clicks "Início" and skips the 3-2-1 countdown. */
export async function startMatch(page: Page) {
  await page.getByRole('button', { name: 'Início' }).click()
  await expect(page.getByText('3', { exact: true })).toBeVisible()
  for (let i = 0; i < 3; i++) await page.clock.runFor(1000)
  await page.clock.runFor(200)
  await expect(page.getByLabel('Sua resposta')).toBeFocused()
}

export async function answerCorrectly(page: Page, times: number) {
  const input = page.getByLabel('Sua resposta')
  for (let i = 0; i < times; i++) {
    await input.fill(String(await currentAnswer(page)))
    await input.press('Enter')
  }
}

export async function answerWrong(page: Page) {
  const input = page.getByLabel('Sua resposta')
  await input.fill(String((await currentAnswer(page)) + 1))
  await input.press('Enter')
}

/** Lets the remaining time run out (second by second, like the real timer). */
export async function finishMatch(page: Page) {
  for (let i = 0; i < 101; i++) await page.clock.runFor(1000)
  await expect(page.getByText('Fim do tempo!')).toBeVisible()
}

export async function register(page: Page, username: string, email: string, password = 'secret123') {
  await page.getByRole('button', { name: 'Entrar' }).click()
  await page.getByRole('tab', { name: 'Criar conta' }).click()
  await page.getByLabel('Nome / Nickname').fill(username)
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha').fill(password)
  await page.getByRole('button', { name: 'Criar conta e entrar' }).click()
}
