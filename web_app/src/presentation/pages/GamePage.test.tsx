import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BRAZILIAN_RULERS, BRAZILIAN_STATES, GameMode } from '../../domain'
import { advanceTime, answerFromLabel, createServices, renderWithProviders } from '../../test/renderWithProviders'
import { rulerPrompt } from '../i18n/rulerPrompt'
import { GamePage } from './GamePage'

const advance = advanceTime

const currentAnswer = () => answerFromLabel(screen.getByRole('math').getAttribute('aria-label')!)

function setup(mode: GameMode = GameMode.ROOT_EXTRACTION) {
  const onFinished = vi.fn()
  const services = createServices()
  renderWithProviders(<GamePage mode={mode} personalBest={50} onFinished={onFinished} />, services)
  const user = userEvent.setup({ delay: null })
  return { onFinished, services, user }
}

async function skipCountdown() {
  await advance(3000)
  // First timer tick
  await advance(100)
}

describe('GamePage', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: false })
  })

  it('shows the 3-2-1 countdown before the first question', async () => {
    setup()
    expect(screen.getByText('3')).toBeInTheDocument()
    await advance(1000)
    expect(screen.getByText('2')).toBeInTheDocument()
    await advance(1000)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.queryByRole('math')).not.toBeInTheDocument()

    await advance(1100)
    expect(screen.getByRole('math')).toBeInTheDocument()
    expect(screen.getByText('Tempo: 100')).toBeInTheDocument()
    expect(screen.getByText('Resultado mais alto: 50')).toBeInTheDocument()
  })

  it('keeps the focus on the answer box and scores correct answers with Enter', async () => {
    const { user } = setup()
    await skipCountdown()
    const input = screen.getByLabelText('Sua resposta')
    expect(input).toHaveFocus()
    expect(input).toHaveAttribute('inputmode', 'numeric')

    await user.type(input, `${currentAnswer()}{Enter}`)

    expect(screen.getByTestId('score')).toHaveTextContent('Resultado: 1')
    expect(input).toHaveValue('')
    expect(input).toHaveFocus()
  })

  it('scores with the "Respondida" button too', async () => {
    const { user } = setup()
    await skipCountdown()
    await user.type(screen.getByLabelText('Sua resposta'), String(currentAnswer()))
    await user.click(screen.getByRole('button', { name: 'Respondida' }))
    expect(screen.getByTestId('score')).toHaveTextContent('Resultado: 1')
  })

  it('shows a red border after the first mistake and reveals the answer after the second', async () => {
    const { user } = setup()
    await skipCountdown()
    const answer = currentAnswer()
    const label = screen.getByRole('math').getAttribute('aria-label')

    await user.type(screen.getByLabelText('Sua resposta'), `${answer + 1}{Enter}`)
    const input = screen.getByLabelText('Sua resposta')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveValue('')
    expect(screen.getByText('Errou! Tente mais uma vez.')).toBeInTheDocument()

    await user.type(input, `${answer + 2}{Enter}`)
    const reveal = screen.getByRole('alert')
    expect(reveal).toHaveTextContent(`= ${answer}`)
    expect(screen.queryByLabelText('Sua resposta')).not.toBeInTheDocument()

    await advance(1000)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Sua resposta')).toBeInTheDocument()
    expect(screen.getByRole('math').getAttribute('aria-label')).not.toBe(label)
    expect(screen.getByTestId('score')).toHaveTextContent('Resultado: 0')
  })

  it('ignores letters typed in the answer box', async () => {
    const { user } = setup()
    await skipCountdown()
    const input = screen.getByLabelText('Sua resposta')
    await user.type(input, 'a1b2')
    expect(input).toHaveValue('12')
  })

  it('beeps on each countdown second and plays a different sound when the match starts', async () => {
    const { services } = setup()
    expect(services.beeper.countdownTick).toHaveBeenCalledTimes(1)
    await advance(1000)
    expect(services.beeper.countdownTick).toHaveBeenCalledTimes(2)
    await advance(1000)
    expect(services.beeper.countdownTick).toHaveBeenCalledTimes(3)
    expect(services.beeper.start).not.toHaveBeenCalled()

    await advance(1000)
    expect(services.beeper.start).toHaveBeenCalledTimes(1)
    expect(services.beeper.countdownTick).toHaveBeenCalledTimes(3)

    await advance(5000)
    expect(services.beeper.start).toHaveBeenCalledTimes(1)
  })

  it('keeps the clock running while the answer is revealed, so that second is lost', async () => {
    const { user } = setup()
    await skipCountdown()
    expect(screen.getByText('Tempo: 100')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Sua resposta'), `${currentAnswer() + 1}{Enter}`)
    await user.type(screen.getByLabelText('Sua resposta'), `${currentAnswer() + 1}{Enter}`)
    expect(screen.getByRole('alert')).toBeInTheDocument()

    await advance(1000)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByText('Tempo: 99')).toBeInTheDocument()
  })

  it('beeps once at 10 seconds left and reports the match at the end', async () => {
    const { user, services, onFinished } = setup(GameMode.EXPONENTIATION)
    await skipCountdown()
    await user.type(screen.getByLabelText('Sua resposta'), `${currentAnswer()}{Enter}`)
    await user.type(screen.getByLabelText('Sua resposta'), `${currentAnswer() + 1}{Enter}`)

    await advance(89_000)
    expect(services.beeper.warning).not.toHaveBeenCalled()
    await advance(1_000)
    expect(screen.getByText('Tempo: 10')).toBeInTheDocument()
    expect(services.beeper.warning).toHaveBeenCalledTimes(1)

    await advance(10_000)
    expect(services.beeper.warning).toHaveBeenCalledTimes(1)
    expect(onFinished).toHaveBeenCalledTimes(1)
    expect(onFinished).toHaveBeenCalledWith({ mode: GameMode.EXPONENTIATION, score: 1, wrongAnswers: 1 })
  })

  it('chimes each time a star is earned', async () => {
    const { user, services } = setup(GameMode.EXPONENTIATION)
    await skipCountdown()
    for (let i = 0; i < 9; i++) {
      await user.type(screen.getByLabelText('Sua resposta'), `${currentAnswer()}{Enter}`)
    }
    expect(services.beeper.star).not.toHaveBeenCalled()

    await user.type(screen.getByLabelText('Sua resposta'), `${currentAnswer()}{Enter}`)
    expect(services.beeper.star).toHaveBeenCalledTimes(1)

    for (let i = 0; i < 9; i++) {
      await user.type(screen.getByLabelText('Sua resposta'), `${currentAnswer()}{Enter}`)
    }
    expect(services.beeper.star).toHaveBeenCalledTimes(1)
    await user.type(screen.getByLabelText('Sua resposta'), `${currentAnswer()}{Enter}`)
    expect(services.beeper.star).toHaveBeenCalledTimes(2)
  })

  it('chimes for stars in the flags game too', async () => {
    const { user, services } = setup(GameMode.STATE_FLAGS)
    await skipCountdown()
    const flagName = () => BRAZILIAN_STATES.find((state) =>
      state.code === screen.getByRole('img', { name: 'Bandeira de um estado brasileiro' }).getAttribute('data-state'))!.name
    for (let i = 0; i < 10; i++) {
      await user.type(screen.getByLabelText('Sua resposta'), `${flagName()}{Enter}`)
    }
    expect(services.beeper.star).toHaveBeenCalledTimes(1)
  })

  describe('flags', () => {
    const flag = () => screen.getByRole('img', { name: 'Bandeira de um estado brasileiro' })
    const currentState = () => BRAZILIAN_STATES.find((state) => state.code === flag().getAttribute('data-state'))!

    it('shows a flag and accepts the state name without accents', async () => {
      const { user } = setup(GameMode.STATE_FLAGS)
      await skipCountdown()
      expect(screen.getByText('De qual estado é esta bandeira?')).toBeInTheDocument()
      expect(flag()).toHaveAttribute('src', `/flags/${currentState().code}.webp`)
      const input = screen.getByLabelText('Sua resposta')
      expect(input).toHaveAttribute('inputmode', 'text')

      const typed = currentState().name.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
      await user.type(input, `${typed}{Enter}`)

      expect(screen.getByTestId('score')).toHaveTextContent('Resultado: 1')
      expect(input).toHaveValue('')
    })

    it('reveals the state name after the second mistake and moves to another flag', async () => {
      const { user } = setup(GameMode.STATE_FLAGS)
      await skipCountdown()
      const state = currentState()

      await user.type(screen.getByLabelText('Sua resposta'), 'Atlântida{Enter}')

      // First mistake: same flag, one more try
      expect(screen.getByText('Errou! Tente mais uma vez.')).toBeInTheDocument()
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      expect(currentState().code).toBe(state.code)

      await user.type(screen.getByLabelText('Sua resposta'), 'Atlântida{Enter}')

      expect(screen.getByTestId('revealed-answer')).toHaveTextContent(state.name)
      expect(screen.queryByLabelText('Sua resposta')).not.toBeInTheDocument()
      await advance(1000)
      expect(screen.getByRole('alert')).toBeInTheDocument()
      await advance(500)
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      expect(currentState().code).not.toBe(state.code)
      expect(screen.getByTestId('score')).toHaveTextContent('Resultado: 0')
    })
  })

  describe('abbreviations', () => {
    const currentState = () =>
      BRAZILIAN_STATES.find((state) => state.name === screen.getByTestId('prompt').textContent)!

    it('shows a state name and accepts its abbreviation, typed in uppercase letters only', async () => {
      const { user } = setup(GameMode.STATE_ABBREVIATIONS)
      await skipCountdown()
      expect(screen.getByText('Qual é a sigla deste estado?')).toBeInTheDocument()
      const input = screen.getByLabelText('Sua resposta')
      expect(input).toHaveAttribute('maxlength', '2')

      await user.type(input, '1m-g')
      expect(input).toHaveValue('MG')
      await user.clear(input)

      await user.type(input, `${currentState().code}{Enter}`)
      expect(screen.getByTestId('score')).toHaveTextContent('Resultado: 1')
    })

    it('reveals the state name and its abbreviation after the second mistake', async () => {
      const { user } = setup(GameMode.STATE_ABBREVIATIONS)
      await skipCountdown()
      const state = currentState()
      await user.type(screen.getByLabelText('Sua resposta'), 'XX{Enter}')
      await user.type(screen.getByLabelText('Sua resposta'), 'XX{Enter}')

      const reveal = screen.getByRole('alert')
      expect(reveal).toHaveTextContent(state.name)
      expect(screen.getByTestId('revealed-answer')).toHaveTextContent(state.code.toUpperCase())
      await advance(1500)
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      expect(screen.getByTestId('score')).toHaveTextContent('Resultado: 0')
    })
  })

  describe('capitals', () => {
    const currentState = () =>
      BRAZILIAN_STATES.find((state) => state.name === screen.getByTestId('prompt').textContent)!

    it('shows a state name and accepts its capital without accents', async () => {
      const { user } = setup(GameMode.STATE_CAPITALS)
      await skipCountdown()
      expect(screen.getByText('Qual é a capital deste estado?')).toBeInTheDocument()
      const input = screen.getByLabelText('Sua resposta')
      expect(input).toHaveAttribute('placeholder', 'Nome da capital')

      const typed = currentState().capital.normalize('NFD').replace(/\p{Diacritic}/gu, '').toUpperCase()
      await user.type(input, `${typed}{Enter}`)

      expect(screen.getByTestId('score')).toHaveTextContent('Resultado: 1')
    })

    it('reveals the state and its capital after the second mistake', async () => {
      const { user } = setup(GameMode.STATE_CAPITALS)
      await skipCountdown()
      const state = currentState()

      await user.type(screen.getByLabelText('Sua resposta'), 'Atlântida{Enter}')
      await user.type(screen.getByLabelText('Sua resposta'), 'Atlântida{Enter}')

      expect(screen.getByRole('alert')).toHaveTextContent(state.name)
      expect(screen.getByTestId('revealed-answer')).toHaveTextContent(state.capital)
      await advance(1500)
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  describe('capital demonyms', () => {
    const currentState = () =>
      BRAZILIAN_STATES.find((state) => state.capital === screen.getByTestId('prompt').textContent)!

    it('shows a capital and accepts its demonym', async () => {
      const { user } = setup(GameMode.CAPITAL_DEMONYMS)
      await skipCountdown()
      expect(screen.getByText('Qual é o gentílico de quem nasce nesta capital?')).toBeInTheDocument()
      expect(screen.getByLabelText('Sua resposta')).toHaveAttribute('placeholder', 'Gentílico')

      await user.type(screen.getByLabelText('Sua resposta'), `${currentState().capitalDemonyms[0]}{Enter}`)

      expect(screen.getByTestId('score')).toHaveTextContent('Resultado: 1')
    })

    it('reveals the capital and its main demonym after the second mistake', async () => {
      const { user } = setup(GameMode.CAPITAL_DEMONYMS)
      await skipCountdown()
      const state = currentState()

      await user.type(screen.getByLabelText('Sua resposta'), 'atlante{Enter}')
      await user.type(screen.getByLabelText('Sua resposta'), 'atlante{Enter}')

      expect(screen.getByRole('alert')).toHaveTextContent(state.capital)
      expect(screen.getByTestId('revealed-answer')).toHaveTextContent(state.capitalDemonyms[0])
      await advance(1500)
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  describe('map', () => {
    const mapName = 'Mapa do Brasil com um estado destacado'
    const currentState = async () => {
      const map = await screen.findByRole('img', { name: mapName })
      return BRAZILIAN_STATES.find((state) => state.code === map.getAttribute('data-state'))!
    }

    it('highlights a state on the map and accepts its name', async () => {
      const { user } = setup(GameMode.STATE_MAP)
      await skipCountdown()
      expect(screen.getByText('Qual é o estado destacado no mapa?')).toBeInTheDocument()
      expect(screen.getByText('Mapa: MapSVG / Victor Cazanave (CC BY 4.0)')).toBeInTheDocument()
      const state = await currentState()

      await user.type(screen.getByLabelText('Sua resposta'), `${state.name}{Enter}`)

      expect(screen.getByTestId('score')).toHaveTextContent('Resultado: 1')
    })

    it('reveals the state name on the map after the second mistake', async () => {
      const { user } = setup(GameMode.STATE_MAP)
      await skipCountdown()
      const state = await currentState()

      await user.type(screen.getByLabelText('Sua resposta'), 'Atlântida{Enter}')
      await user.type(screen.getByLabelText('Sua resposta'), 'Atlântida{Enter}')

      expect(screen.getByTestId('revealed-answer')).toHaveTextContent(state.name)
      await advance(1500)
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  describe('state demonyms', () => {
    const currentState = () =>
      BRAZILIAN_STATES.find((state) => state.name === screen.getByTestId('prompt').textContent)!

    it('shows a state name and accepts its demonym', async () => {
      const { user } = setup(GameMode.STATE_DEMONYMS)
      await skipCountdown()
      expect(screen.getByText('Qual é o gentílico de quem nasce neste estado?')).toBeInTheDocument()

      await user.type(screen.getByLabelText('Sua resposta'), `${currentState().stateDemonyms[0]}{Enter}`)

      expect(screen.getByTestId('score')).toHaveTextContent('Resultado: 1')
    })

    it('reveals the state and its main demonym after the second mistake', async () => {
      const { user } = setup(GameMode.STATE_DEMONYMS)
      await skipCountdown()
      const state = currentState()

      await user.type(screen.getByLabelText('Sua resposta'), 'atlante{Enter}')
      await user.type(screen.getByLabelText('Sua resposta'), 'atlante{Enter}')

      expect(screen.getByRole('alert')).toHaveTextContent(state.name)
      expect(screen.getByTestId('revealed-answer')).toHaveTextContent(state.stateDemonyms[0])
    })
  })

  describe('Brazilian rulers', () => {
    const currentRuler = () =>
      BRAZILIAN_RULERS.find((ruler) => rulerPrompt(ruler) === screen.getByTestId('prompt').textContent)!

    it('shows a period and accepts who governed then', async () => {
      const { user } = setup(GameMode.BRAZIL_RULERS)
      await skipCountdown()
      expect(screen.getByLabelText('Sua resposta')).toHaveAttribute('placeholder', 'Nome do governante')

      await user.type(screen.getByLabelText('Sua resposta'), `${currentRuler().name}{Enter}`)

      expect(screen.getByTestId('score')).toHaveTextContent('Resultado: 1')
    })

    it('reveals the period and the ruler after the second mistake, for 1.5 s', async () => {
      const { user } = setup(GameMode.BRAZIL_RULERS)
      await skipCountdown()
      const ruler = currentRuler()

      await user.type(screen.getByLabelText('Sua resposta'), 'Ninguém{Enter}')
      await user.type(screen.getByLabelText('Sua resposta'), 'Ninguém{Enter}')

      expect(screen.getByRole('alert')).toHaveTextContent(rulerPrompt(ruler))
      expect(screen.getByTestId('revealed-answer')).toHaveTextContent(ruler.name)
      await advance(1500)
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })
})
