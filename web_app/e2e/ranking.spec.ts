import { expect, test } from '@playwright/test'
import { answerCorrectly, finishMatch, openGame, register, startMatch, uniqueTag } from './support/game'

test.describe('Ranking and accounts', () => {
  test.beforeEach(async ({ page }) => openGame(page))

  test('a guest keeps the record locally and can publish it on the global ranking', async ({ page }) => {
    const name = `Guest${uniqueTag()}`
    await startMatch(page)
    await answerCorrectly(page, 7)
    await finishMatch(page)

    await expect(page.getByText(/Resultado salvo neste navegador/)).toBeVisible()
    await page.getByLabel('Seu nome').fill(name)
    await page.getByRole('button', { name: 'Enviar para o ranking' }).click()
    await expect(page.getByRole('status')).toHaveText('Resultado salvo no ranking!')

    await page.getByRole('button', { name: 'Highscores' }).click()
    // "Os seus resultados" of a guest comes from the browser
    await expect(page.getByRole('cell', { name: 'Você' })).toBeVisible()
    await page.getByRole('tab', { name: 'Dia' }).click()
    await expect(page.getByRole('cell', { name })).toBeVisible()
    await page.getByRole('button', { name: 'Voltar' }).click()

    await page.getByRole('button', { name: 'Início' }).click()
    await expect(page.getByText('O seu resultado mais alto:').locator('..')).toContainText('7')
  })

  test('a registered player saves results on the server and keeps the session after reload', async ({ page }) => {
    const tag = uniqueTag()
    await register(page, `Player${tag}`, `player${tag}@mail.com`)
    await expect(page.getByText(`Olá, Player${tag}!`)).toBeVisible()

    await page.getByText('Radiciação').click()
    await startMatch(page)
    await answerCorrectly(page, 9)
    await finishMatch(page)
    await expect(page.getByRole('status')).toHaveText('Resultado salvo no ranking!')

    await page.reload()
    await expect(page.getByText(`Olá, Player${tag}!`)).toBeVisible()
    await page.getByText('Radiciação').click()
    await expect(page.getByText('O seu resultado mais alto:').locator('..')).toContainText('9')

    await page.getByRole('button', { name: 'Highscores' }).click()
    await expect(page.getByRole('cell', { name: `Player${tag}` })).toBeVisible()
  })

  test('shows friendly errors for duplicated e-mail and wrong password', async ({ page }) => {
    const tag = uniqueTag()
    await register(page, `Dup${tag}`, `dup${tag}@mail.com`)
    await expect(page.getByText(`Olá, Dup${tag}!`)).toBeVisible()
    await page.getByRole('button', { name: 'Sair' }).click()

    await register(page, `Other${tag}`, `dup${tag}@mail.com`)
    await expect(page.getByRole('alert')).toHaveText('Este e-mail já está cadastrado.')

    await page.getByRole('tab', { name: 'Entrar' }).click()
    await page.getByLabel('E-mail').fill(`dup${tag}@mail.com`)
    await page.getByLabel('Senha').fill('wrong-password')
    await page.getByRole('dialog').getByRole('button', { name: 'Entrar' }).click()
    await expect(page.getByRole('alert')).toHaveText('E-mail ou senha incorretos.')
  })
})
