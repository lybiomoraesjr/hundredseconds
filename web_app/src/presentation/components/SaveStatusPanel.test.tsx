import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../infrastructure/http/ApiError'
import { renderWithProviders } from '../../test/renderWithProviders'
import { SaveStatusPanel } from './SaveStatusPanel'

describe('SaveStatusPanel', () => {
  beforeEach(() => window.localStorage.clear())

  it('confirms the save for logged players', () => {
    renderWithProviders(<SaveStatusPanel state={{ status: 'SAVED' }} isGuest={false} onSubmitGuestName={vi.fn()} />)
    expect(screen.getByRole('status')).toHaveTextContent('Resultado salvo no ranking!')
  })

  it('lets a guest publish the result with a name', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    renderWithProviders(<SaveStatusPanel state={{ status: 'SAVED_LOCALLY' }} isGuest onSubmitGuestName={onSubmit} />)

    expect(screen.getByText(/Resultado salvo neste navegador/)).toBeInTheDocument()
    await userEvent.type(screen.getByLabelText('Seu nome'), 'Visitante')
    await userEvent.click(screen.getByRole('button', { name: 'Enviar para o ranking' }))

    expect(onSubmit).toHaveBeenCalledWith('Visitante')
    expect(await screen.findByRole('status')).toHaveTextContent('Resultado salvo no ranking!')
  })

  it('requires a guest name and shows API errors', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new ApiError(0, 'NETWORK_ERROR', 'offline'))
    renderWithProviders(<SaveStatusPanel state={{ status: 'SAVED_LOCALLY' }} isGuest onSubmitGuestName={onSubmit} />)

    await userEvent.click(screen.getByRole('button', { name: 'Enviar para o ranking' }))
    expect(screen.getByText('Informe um nome com até 50 caracteres.')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()

    await userEvent.type(screen.getByLabelText('Seu nome'), 'Visitante')
    await userEvent.click(screen.getByRole('button', { name: 'Enviar para o ranking' }))
    expect(await screen.findByText(/Não foi possível conectar ao servidor/)).toBeInTheDocument()
  })

  it('explains a failed save', () => {
    renderWithProviders(<SaveStatusPanel state={{ status: 'FAILED', error: new ApiError(0, 'NETWORK_ERROR', 'x') }}
      isGuest={false} onSubmitGuestName={vi.fn()} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível salvar no ranking.')
  })
})
