import { useCallback, useSyncExternalStore } from 'react'
import { useAppServices } from '../AppServices'
import type { LoginInput, RegisterInput } from '../ports/AuthGateway'

export function useAuth() {
  const { authGateway, sessionStore } = useAppServices()
  const session = useSyncExternalStore(sessionStore.subscribe, sessionStore.getSession)

  const login = useCallback(async (input: LoginInput) => {
    sessionStore.setSession(await authGateway.login(input))
  }, [authGateway, sessionStore])

  /** Creates the account and logs in right away. */
  const register = useCallback(async (input: RegisterInput) => {
    await authGateway.register(input)
    sessionStore.setSession(await authGateway.login({ email: input.email, password: input.password }))
  }, [authGateway, sessionStore])

  const logout = useCallback(() => sessionStore.clear(), [sessionStore])

  return { session, login, register, logout }
}
