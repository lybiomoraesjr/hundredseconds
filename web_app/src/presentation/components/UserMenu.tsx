import { Button, Group, Text } from '@mantine/core'
import { useAuth } from '../../application/auth/useAuth'
import { messages } from '../i18n/messages'

export function UserMenu({ onLoginClick }: { onLoginClick: () => void }) {
  const { session, logout } = useAuth()
  if (!session) {
    return <Button variant="white" color="orange.8" size="xs" onClick={onLoginClick}>{messages.auth.login}</Button>
  }
  return (
    <Group gap="xs" wrap="nowrap">
      <Text size="sm" fw={600} c="white">{messages.auth.greeting(session.username)}</Text>
      <Button variant="white" color="orange.8" size="xs" onClick={logout}>{messages.auth.logout}</Button>
    </Group>
  )
}
