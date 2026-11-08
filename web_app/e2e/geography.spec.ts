import { expect, test } from '@playwright/test'
import { finishMatch, openGame, register, startMatch, uniqueTag } from './support/game'
import { answerGeographyCorrectly, GEOGRAPHY_GAMES, missGeographyQuestion } from './support/geography'

test.describe('Geography games', () => {
  test.beforeEach(async ({ page }) => openGame(page))

  for (const game of GEOGRAPHY_GAMES) {
    test(`${game.label}: plays a match and saves the result on the server`, async ({ page }) => {
      const tag = uniqueTag()
      await register(page, `Geo${tag}`, `geo${tag}@mail.com`)
      await expect(page.getByText(`Olá, Geo${tag}!`)).toBeVisible()

      await page.getByText(game.label, { exact: true }).click()
      await startMatch(page)
      await expect(page.getByText(game.question)).toBeVisible()

      await answerGeographyCorrectly(page, game, 3)
      await missGeographyQuestion(page, game)
      await finishMatch(page)

      await expect(page.getByTestId('result-score')).toContainText('3')
      // The API only accepts the result if it knows this game mode (one migration per game)
      await expect(page.getByRole('status')).toHaveText('Resultado salvo no ranking!')

      await page.getByRole('button', { name: 'Início' }).click()
      await expect(page.getByText('O seu resultado mais alto:').locator('..')).toContainText('3')

      await page.getByRole('button', { name: 'Highscores' }).click()
      await expect(page.getByRole('dialog')).toContainText(game.label)
      await expect(page.getByRole('cell', { name: `Geo${tag}` })).toBeVisible()
    })
  }
})
