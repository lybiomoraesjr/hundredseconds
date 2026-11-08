import { Button, Group, SegmentedControl, Stack, Text, Title, useMatches } from '@mantine/core'
import type { ScoreSummary } from '../../application/ports/ScoreGateway'
import { GameMode } from '../../domain'
import { GameBoard } from '../components/GameBoard'
import { ScoreSummaryPanel } from '../components/ScoreSummaryPanel'
import { UserMenu } from '../components/UserMenu'
import { messages } from '../i18n/messages'

interface HomePageProps {
  mode: GameMode
  summary: ScoreSummary | null
  onModeChange: (mode: GameMode) => void
  onStart: () => void
  onOpenHighscores: () => void
  onOpenLogin: () => void
}

export function HomePage({ mode, summary, onModeChange, onStart, onOpenHighscores, onOpenLogin }: HomePageProps) {
  // Smaller labels on phones so the three modes fit the board
  const selectorSize = useMatches({ base: 'sm', xs: 'md' })
  return (
    <GameBoard>
      <Group justify="flex-end" mb="xs">
        <UserMenu onLoginClick={onOpenLogin} />
      </Group>
      <Group justify="space-between" align="flex-start" gap="md">
        <Stack gap={4} maw={420}>
          <Title order={1} c="white">{messages.appTitle}</Title>
          <Text c="white">{messages.appTagline}</Text>
        </Stack>
        <ScoreSummaryPanel summary={summary} />
      </Group>

      <Stack align="center" justify="center" gap="xl" flex={1} py="xl">
        <SegmentedControl
          aria-label={messages.modeSelectorLabel}
          value={mode}
          onChange={(value) => onModeChange(value as GameMode)}
          size={selectorSize}
          radius="xl"
          fullWidth
          w="100%"
          maw={460}
          data={Object.values(GameMode).map((value) => ({ value, label: messages.modes[value] }))}
        />
        <Button size="xl" radius="xl" color="green.6" px={56} onClick={onStart}>
          {messages.start}
        </Button>
      </Stack>

      <Group justify="flex-end">
        <Button variant="white" color="orange.8" onClick={onOpenHighscores}>{messages.highscores}</Button>
      </Group>
    </GameBoard>
  )
}
