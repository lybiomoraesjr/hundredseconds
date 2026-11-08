import { expect, test } from '@playwright/test'
import { answerCorrectly, answerWrong, currentAnswer, finishMatch, openGame, startMatch } from './support/game'

test.describe('Gameplay', () => {
  test.beforeEach(async ({ page }) => {
    // Records the frequency of every tone the game synthesizes
    await page.addInitScript(() => {
      const tones: number[] = []
      Object.assign(window, { __tones: tones })
      const original = AudioContext.prototype.createOscillator
      AudioContext.prototype.createOscillator = function (this: AudioContext) {
        const oscillator = original.call(this)
        const start = oscillator.start.bind(oscillator)
        oscillator.start = (...args: Parameters<OscillatorNode['start']>) => {
          tones.push(oscillator.frequency.value)
          start(...args)
        }
        return oscillator
      }
    })
    await openGame(page)
  })

  test('counts correct answers, gives stars and keeps the focus', async ({ page }) => {
    await startMatch(page)
    await expect(page.getByText('Tempo: 100')).toBeVisible()

    await answerCorrectly(page, 10)

    await expect(page.getByText('Resultado: 10')).toBeVisible()
    await expect(page.getByRole('img', { name: '1 de 10 estrelas' })).toBeVisible()
    await expect(page.getByLabel('Sua resposta')).toBeFocused()
  })

  test('first mistake shows a red border, second one reveals the answer for one second', async ({ page }) => {
    await page.getByText('Radiciação').click()
    await startMatch(page)
    const answer = await currentAnswer(page)

    await answerWrong(page)
    await expect(page.getByLabel('Sua resposta')).toHaveAttribute('aria-invalid', 'true')
    await expect(page.getByText('Errou! Tente mais uma vez.')).toBeVisible()

    await answerWrong(page)
    await expect(page.getByRole('alert')).toContainText(`= ${answer}`)
    await expect(page.getByLabel('Sua resposta')).toBeHidden()

    await page.clock.runFor(1100)
    await expect(page.getByRole('alert')).toBeHidden()
    await expect(page.getByLabel('Sua resposta')).toBeFocused()
    await expect(page.getByText('Resultado: 0')).toBeVisible()
    // The clock kept running during the reveal: that second is lost
    await expect(page.getByText('Tempo: 99')).toBeVisible()
  })

  test('plays a beep on each countdown second and a different sound at the start', async ({ page }) => {
    await startMatch(page)
    await page.clock.runFor(2000)

    const tones = await page.evaluate(() => (window as unknown as { __tones: number[] }).__tones)
    // 3, 2, 1 at 660 Hz, then the start sound at 1320 Hz, and nothing else yet
    expect(tones).toEqual([660, 660, 660, 1320])
  })

  test('shows the result with score, stars and wrong answers after 100 seconds', async ({ page }) => {
    await startMatch(page)
    await answerCorrectly(page, 12)
    await answerWrong(page)

    await finishMatch(page)

    await expect(page.getByTestId('result-score')).toHaveText('12')
    await expect(page.getByTestId('result-stars')).toHaveText('1')
    await expect(page.getByTestId('result-wrong')).toHaveText('1')
    await page.getByRole('button', { name: 'Jogar novamente' }).click()
    await expect(page.getByText('3', { exact: true })).toBeVisible()
  })
})
