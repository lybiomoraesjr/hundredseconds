import { Alert, Button, Group, Stack, Text, TextInput } from '@mantine/core'
import { useLocalStorage } from '@mantine/hooks'
import { useState, type FormEvent } from 'react'
import { errorMessage } from '../i18n/errorMessage'
import { messages } from '../i18n/messages'

export type SaveState =
  | { status: 'SAVING' }
  | { status: 'SAVED' }
  | { status: 'SAVED_LOCALLY' }
  | { status: 'FAILED'; error: unknown }

interface SaveStatusPanelProps {
  state: SaveState
  isGuest: boolean
  onSubmitGuestName: (name: string) => Promise<void>
}

const t = messages.saving

/** Shows where the result was saved; guests may also publish it on the global ranking. */
export function SaveStatusPanel({ state, isGuest, onSubmitGuestName }: SaveStatusPanelProps) {
  // Remembers the last name typed by the guest
  const [guestName, setGuestName] = useLocalStorage({ key: 'hundred-seconds:guest-name', defaultValue: '' })
  const [guestState, setGuestState] = useState<'IDLE' | 'SENDING' | 'SENT'>('IDLE')
  const [guestError, setGuestError] = useState<string | null>(null)

  const handleGuestSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const name = guestName.trim()
    if (!name || name.length > 50) {
      setGuestError(t.guestNameRequired)
      return
    }
    setGuestState('SENDING')
    setGuestError(null)
    try {
      await onSubmitGuestName(name)
      setGuestState('SENT')
    } catch (error) {
      setGuestState('IDLE')
      setGuestError(errorMessage(error))
    }
  }

  if (state.status === 'SAVING') return <Text c="white" size="sm">{t.saving}</Text>
  if (state.status === 'FAILED') {
    return (
      <Alert color="red" role="alert" title={t.failed} maw={420}>
        {errorMessage(state.error)} {t.savedLocally}
      </Alert>
    )
  }
  if (!isGuest) return <Text c="white" fw={600} size="sm" role="status">{t.saved}</Text>
  if (guestState === 'SENT') return <Text c="white" fw={600} size="sm" role="status">{t.saved}</Text>

  return (
    <Stack gap={6} align="center" maw={420}>
      <Text c="white" size="sm">{t.savedLocally} {t.guestPrompt}</Text>
      <form onSubmit={handleGuestSubmit}>
        <Group gap="xs" align="flex-start" justify="center">
          <TextInput aria-label={t.guestNameLabel} placeholder={t.guestNameLabel} value={guestName}
            onChange={(event) => {
              setGuestName(event.currentTarget.value)
              setGuestError(null)
            }}
            error={guestError} maxLength={50} w={220} />
          <Button type="submit" variant="white" color="orange.8" loading={guestState === 'SENDING'}>
            {t.guestSubmit}
          </Button>
        </Group>
      </form>
    </Stack>
  )
}
