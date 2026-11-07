import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../infrastructure/http/ApiError'
import { createFakeAuthGateway, createServices, renderWithProviders } from '../../test/renderWithProviders'
import { AuthModal } from './AuthModal'

describe('AuthModal', () => {
  it('logs in and closes', async () => {
    const onClose = vi.fn()
    const { services } = renderWithProviders(<AuthModal onClose={onClose} />)

    await userEvent.type(screen.getByLabelText('E-mail'), 'ana@mail.com')
    await userEvent.type(screen.getByLabelText('Senha'), 'secret123')
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => expect(onClose).toHaveBeenCalled())
    expect(services.authGateway.login).toHaveBeenCalledWith({ email: 'ana@mail.com', password: 'secret123' })
    expect(services.sessionStore.getSession()?.username).toBe('ana')
  })

  it('shows the translated API error on wrong credentials', async () => {
    const authGateway = createFakeAuthGateway({
      login: vi.fn().mockRejectedValue(new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid e-mail or password')),
    })
    const onClose = vi.fn()
    renderWithProviders(<AuthModal onClose={onClose} />, createServices({ authGateway }))

    await userEvent.type(screen.getByLabelText('E-mail'), 'ana@mail.com')
    await userEvent.type(screen.getByLabelText('Senha'), 'wrong')
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('E-mail ou senha incorretos.')
    expect(onClose).not.toHaveBeenCalled()
  })

  it('validates the register form before calling the API', async () => {
    const { services } = renderWithProviders(<AuthModal onClose={vi.fn()} />)
    await userEvent.click(screen.getByRole('tab', { name: 'Criar conta' }))
    await userEvent.type(screen.getByLabelText('E-mail'), 'not-an-email')
    await userEvent.type(screen.getByLabelText('Senha'), '123')
    await userEvent.click(screen.getByRole('button', { name: 'Criar conta e entrar' }))

    expect(screen.getByText('Informe um nome.')).toBeInTheDocument()
    expect(screen.getByText('Informe um e-mail válido.')).toBeInTheDocument()
    expect(screen.getByText('A senha precisa ter pelo menos 6 caracteres.')).toBeInTheDocument()
    expect(services.authGateway.register).not.toHaveBeenCalled()
  })

  it('registers and logs in right away', async () => {
    const onClose = vi.fn()
    const { services } = renderWithProviders(<AuthModal onClose={onClose} />)
    await userEvent.click(screen.getByRole('tab', { name: 'Criar conta' }))
    await userEvent.type(screen.getByLabelText('Nome / Nickname'), 'Ana')
    await userEvent.type(screen.getByLabelText('E-mail'), 'ana@mail.com')
    await userEvent.type(screen.getByLabelText('Senha'), 'secret123')
    await userEvent.click(screen.getByRole('button', { name: 'Criar conta e entrar' }))

    await waitFor(() => expect(onClose).toHaveBeenCalled())
    expect(services.authGateway.register).toHaveBeenCalledWith({ username: 'Ana', email: 'ana@mail.com', password: 'secret123' })
    expect(services.authGateway.login).toHaveBeenCalledWith({ email: 'ana@mail.com', password: 'secret123' })
  })

  it('explains a duplicated e-mail', async () => {
    const authGateway = createFakeAuthGateway({
      register: vi.fn().mockRejectedValue(new ApiError(409, 'EMAIL_ALREADY_IN_USE', 'E-mail is already in use')),
    })
    renderWithProviders(<AuthModal onClose={vi.fn()} />, createServices({ authGateway }))
    await userEvent.click(screen.getByRole('tab', { name: 'Criar conta' }))
    await userEvent.type(screen.getByLabelText('Nome / Nickname'), 'Ana')
    await userEvent.type(screen.getByLabelText('E-mail'), 'ana@mail.com')
    await userEvent.type(screen.getByLabelText('Senha'), 'secret123')
    await userEvent.click(screen.getByRole('button', { name: 'Criar conta e entrar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Este e-mail já está cadastrado.')
  })
})
