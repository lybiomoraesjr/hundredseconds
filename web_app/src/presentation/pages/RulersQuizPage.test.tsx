import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BRAZILIAN_RULERS, GameMode, type RulersGameMode } from '../../domain'
import { advanceTime, createServices, renderWithProviders } from '../../test/renderWithProviders'
import { rulerHeading, rulerPrompt } from '../i18n/rulerPrompt'
import { RulersQuizPage } from './RulersQuizPage'

function setup(mode: RulersGameMode = GameMode.RULERS_EMPIRE) {
  const onFinished = vi.fn()
  renderWithProviders(<RulersQuizPage mode={mode} onFinished={onFinished} />, createServices())
  const user = userEvent.setup({ delay: null })
  return { onFinished, user }
}

async function skipCountdown() {
  await advanceTime(3000)
  await advanceTime(100)
}

/** The ruler behind the question on screen. */
function currentRuler() {
  const heading = within(screen.getByTestId('question')).getAllByText(/^Quem/)[0].textContent
  const prompt = screen.getByTestId('prompt').textContent
  return BRAZILIAN_RULERS.find((ruler) => rulerHeading(ruler) === heading && rulerPrompt(ruler) === prompt)!
}

const option = (name: string) => within(screen.getByRole('group', { name: 'Alternativas' })).getByRole('button', { name })

describe('RulersQuizPage', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: false })
  })

  it('asks the rulers of the era in chronological order, with four options', async () => {
    setup()
    await skipCountdown()
    expect(screen.getByText('Quem governou o Brasil neste período?')).toBeInTheDocument()
    expect(screen.getByTestId('prompt')).toHaveTextContent('1822 a 1831')
    expect(screen.getByTestId('progress')).toHaveTextContent('Pergunta 1 de 6')
    expect(within(screen.getByRole('group', { name: 'Alternativas' })).getAllByRole('button')).toHaveLength(4)
    expect(option('Dom Pedro I')).toBeInTheDocument()
  })

  it('scores a right choice and moves on shortly after', async () => {
    const { user } = setup()
    await skipCountdown()

    await user.click(option('Dom Pedro I'))
    expect(screen.getByTestId('feedback')).toHaveTextContent('Acertou!')
    expect(screen.getByTestId('score')).toHaveTextContent('Acertos: 1')

    await advanceTime(600)
    expect(screen.getByTestId('progress')).toHaveTextContent('Pergunta 2 de 6')
    expect(currentRuler().name).toBe('Regência Trina Provisória')
  })

  it('shows the right answer after a wrong choice and ignores further clicks', async () => {
    const { user } = setup()
    await skipCountdown()
    const wrong = within(screen.getByRole('group', { name: 'Alternativas' })).getAllByRole('button')
      .find((button) => button.textContent !== 'Dom Pedro I')!

    await user.click(wrong)
    await user.click(option('Dom Pedro I'))

    expect(screen.getByTestId('feedback')).toHaveTextContent('Errou! Era Dom Pedro I.')
    expect(screen.getByTestId('score')).toHaveTextContent('Acertos: 0')
    await advanceTime(1000)
    expect(screen.getByTestId('progress')).toHaveTextContent('Pergunta 1 de 6')
    await advanceTime(500)
    expect(screen.getByTestId('progress')).toHaveTextContent('Pergunta 2 de 6')
  })

  it('counts the time up and finishes after the last ruler with score, mistakes and duration', async () => {
    const { user, onFinished } = setup(GameMode.RULERS_MILITARY)
    await skipCountdown()
    await advanceTime(2000)
    expect(screen.getByTestId('elapsed')).toHaveTextContent('Tempo: 0:02,')

    for (let i = 0; i < 6; i++) {
      const ruler = currentRuler()
      if (i === 0) {
        const wrong = within(screen.getByRole('group', { name: 'Alternativas' })).getAllByRole('button')
          .find((button) => button.textContent !== ruler.name)!
        await user.click(wrong)
        await advanceTime(1500)
      } else {
        await user.click(option(ruler.name))
        await advanceTime(600)
      }
    }

    expect(onFinished).toHaveBeenCalledTimes(1)
    const match = onFinished.mock.calls[0][0]
    expect(match).toMatchObject({ mode: GameMode.RULERS_MILITARY, score: 5, wrongAnswers: 1 })
    expect(match.durationMs).toBeGreaterThanOrEqual(2000 + 1500 + 5 * 600)
  })

  it('asks about the presidents elected who never took office', async () => {
    const { user } = setup(GameMode.RULERS_NEW_REPUBLIC)
    await skipCountdown()
    expect(screen.getByText('Quem foi eleito presidente neste ano, mas não tomou posse?')).toBeInTheDocument()
    expect(screen.getByTestId('prompt')).toHaveTextContent('1985')
    await user.click(option('Tancredo Neves'))
    expect(screen.getByTestId('score')).toHaveTextContent('Acertos: 1')
  })
})
