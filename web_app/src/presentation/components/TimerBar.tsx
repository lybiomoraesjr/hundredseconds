import { Progress, Stack, Text } from '@mantine/core'
import { messages } from '../i18n/messages'

export function TimerBar({ secondsLeft, fraction }: { secondsLeft: number; fraction: number }) {
  return (
    <Stack gap={4} w={{ base: 140, sm: 220 }}>
      <Progress value={fraction * 100} color="green.6" size="lg" radius="xl" bg="rgba(255,255,255,0.35)"
        transitionDuration={100} aria-label={messages.game.time(secondsLeft)} />
      <Text fw={700} c="white">{messages.game.time(secondsLeft)}</Text>
    </Stack>
  )
}
