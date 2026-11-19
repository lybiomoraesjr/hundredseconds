import { expect, test, type Page } from '@playwright/test'
import { BRAZILIAN_RULERS } from '../src/domain/entities/BrazilianRuler'
import { rulerHeading, rulerPrompt } from '../src/presentation/i18n/rulerPrompt'
import { openGame, register, uniqueTag } from './support/game'

/** Name of the ruler behind the question on screen. */
async function currentRulerName(page: Page) {
  const question = page.getByTestId('question')
  const heading = await question.getByText(/^Quem/).textContent()
  const prompt = await page.getByTestId('prompt').textContent()
  const ruler = BRAZILIAN_RULERS.find((candidate) => rulerHeading(candidate) === heading && rulerPrompt(candidate) === prompt)
  if (!ruler) throw new Error(`Unknown ruler question: ${heading} ${prompt}`)
  return ruler.name
}

const options = (page: Page) => page.getByRole('group', { name: 'Alternativas' }).getByRole('button')

test.describe('Rulers time trial', () => {
  test.beforeEach(async ({ page }) => openGame(page))

  test('answers every ruler of the Empire and saves score and time on the server', async ({ page }) => {
    const tag = uniqueTag()
    await register(page, `Hist${tag}`, `hist${tag}@mail.com`)
    await expect(page.getByText(`Olá, Hist${tag}!`)).toBeVisible()

    await expect(page.getByText('Governantes do Brasil')).toBeVisible()
    await page.getByText('Império', { exact: true }).click()
    await page.getByRole('button', { name: 'Início' }).click()
    for (let i = 0; i < 3; i++) await page.clock.runFor(1000)
    await page.clock.runFor(200)
    await expect(page.getByTestId('progress')).toHaveText('Pergunta 1 de 6')

    for (let i = 0; i < 6; i++) {
      await expect(page.getByTestId('progress')).toHaveText(`Pergunta ${i + 1} de 6`)
      const answer = await currentRulerName(page)
      if (i === 2) {
        // One mistake: the right answer is shown for 1.5 s
        await options(page).filter({ hasNotText: answer }).first().click()
        await expect(page.getByTestId('feedback')).toHaveText(`Errou! Era ${answer}.`)
        await page.clock.runFor(1600)
      } else {
        await options(page).getByText(answer, { exact: true }).click()
        await expect(page.getByTestId('feedback')).toHaveText('Acertou!')
        await page.clock.runFor(700)
      }
    }

    await expect(page.getByText('Fim do quiz!')).toBeVisible()
    await expect(page.getByText('Governantes: Império')).toBeVisible()
    await expect(page.getByTestId('result-score')).toHaveText('5/6')
    await expect(page.getByTestId('result-time')).toHaveText(/^0:\d\d,\d$/)
    await expect(page.getByRole('status')).toHaveText('Resultado salvo no ranking!')

    await page.getByRole('button', { name: 'Highscores' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toContainText('Governantes: Império')
    await expect(dialog.getByRole('columnheader', { name: 'Tempo' })).toBeVisible()
    await expect(dialog.getByRole('row', { name: new RegExp(`Hist${tag}`) })).toContainText(/5\s*0:\d\d,\d/)
  })
})
