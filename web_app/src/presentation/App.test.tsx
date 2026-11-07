import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { GameMode, LeaderboardPeriod } from '../domain'
import { advanceTime, createFakeGateway, createServices, renderWithProviders } from '../test/renderWithProviders'
import { App } from './App'

describe('App', () => {
  it('shows the home screen with the summary of the selected mode', async () => {
    const getSummary = vi.fn().mockResolvedValue({ personalBest: 42, todayBest: 80, yearBest: 118 })
    renderWithProviders(<App />, createServices({ scoreGateway: createFakeGateway({ getSummary }) }))

    expect(screen.getByRole('heading', { name: '100 segundos' })).toBeInTheDocument()
    expect(await screen.findByText('118')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(getSummary).toHaveBeenCalledWith(GameMode.EXPONENTIATION)

    await userEvent.click(screen.getByText('Radiciação'))
    await waitFor(() => expect(getSummary).toHaveBeenLastCalledWith(GameMode.ROOT_EXTRACTION))
  })

  it('opens the highscores with the four tabs and loads each period', async () => {
    const getLeaderboard = vi.fn().mockResolvedValue([
      { rank: 1, playerName: 'Ana', score: 118, playedAt: '2026-03-15T10:00:00Z' },
    ])
    renderWithProviders(<App />, createServices({ scoreGateway: createFakeGateway({ getLeaderboard }) }))

    await userEvent.click(screen.getByRole('button', { name: 'Highscores' }))

    for (const tab of ['Os seus resultados', 'Dia', 'Semana', 'Ano']) {
      expect(screen.getByRole('tab', { name: tab })).toBeInTheDocument()
    }
    expect(await screen.findByText('Ana')).toBeInTheDocument()
    expect(getLeaderboard).toHaveBeenCalledWith(GameMode.EXPONENTIATION, LeaderboardPeriod.USER)

    await userEvent.click(screen.getByRole('tab', { name: 'Dia' }))
    expect(await screen.findByRole('heading', { name: 'Resultado mais alto de hoje' })).toBeInTheDocument()
    expect(getLeaderboard).toHaveBeenCalledWith(GameMode.EXPONENTIATION, LeaderboardPeriod.DAY)

    await userEvent.click(screen.getByRole('button', { name: 'Voltar' }))
    await waitFor(() => expect(screen.queryByRole('tab', { name: 'Dia' })).not.toBeInTheDocument())
  })

  it('plays a full match, saves it and shows the result screen', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: false })
    const services = createServices()
    const { unmount } = renderWithProviders(<App />, services)
    const user = userEvent.setup({ delay: null })

    await user.click(screen.getByRole('button', { name: 'Início' }))
    expect(services.beeper.unlock).toHaveBeenCalled()

    await advanceTime(3_000 + 100_100, 500)

    expect(await screen.findByText('Fim do tempo!')).toBeInTheDocument()
    expect(screen.getByTestId('result-score')).toHaveTextContent('0')
    expect(screen.getByTestId('result-wrong')).toHaveTextContent('0')
    expect(services.scoreGateway.saveScore)
      .toHaveBeenCalledWith({ mode: GameMode.EXPONENTIATION, score: 0, wrongAnswers: 0 })
    // Guests are offered to publish the result on the global ranking
    expect(await screen.findByLabelText('Seu nome')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Jogar novamente' }))
    expect(screen.getByText('3')).toBeInTheDocument()
    unmount()
    vi.useRealTimers()
  })
  it('shows the logged player and lets them log out', async () => {
    renderWithProviders(<App />)

    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))
    await userEvent.type(screen.getByLabelText('E-mail'), 'ana@mail.com')
    await userEvent.type(screen.getByLabelText('Senha'), 'secret123')
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByText('Olá, ana!')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Sair' }))
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument()
  })
})
