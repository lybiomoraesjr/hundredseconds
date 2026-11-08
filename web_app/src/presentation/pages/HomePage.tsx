import { Button, Chip, Group, Stack, Text, Title } from '@mantine/core'
import type { ScoreSummary } from '../../application/ports/ScoreGateway'
import { GameMode } from '../../domain'
import { GameBoard } from '../components/GameBoard'
import { ScoreSummaryPanel } from '../components/ScoreSummaryPanel'
import { UserMenu } from '../components/UserMenu'
import { messages } from '../i18n/messages'
import { GAME_MODE_GROUPS } from './gameModeGroups'

interface HomePageProps {
  mode: GameMode
  summary: ScoreSummary | null
  onModeChange: (mode: GameMode) => void
  onStart: () => void
  onOpenHighscores: () => void
  onOpenLogin: () => void
}

export function HomePage({ mode, summary, onModeChange, onStart, onOpenHighscores, onOpenLogin }: HomePageProps) {
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
        {/* Chips wrap to new lines, so new games keep fitting on small screens */}
        <Chip.Group multiple={false} value={mode} onChange={(value) => onModeChange(value as GameMode)}>
          <Stack gap="md" align="center" role="radiogroup" aria-label={messages.modeSelectorLabel} maw={560}>
            {GAME_MODE_GROUPS.map((group) => (
              <Stack key={group.label} gap={6} align="center">
                <Text c="white" fw={700} size="sm" tt="uppercase" opacity={0.9}>{group.label}</Text>
                <Group justify="center" gap="xs">
                  {group.modes.map((value) => (
                    <Chip key={value} value={value} size="md" variant="filled" color="green.6">
                      {messages.modes[value]}
                    </Chip>
                  ))}
                </Group>
              </Stack>
            ))}
          </Stack>
        </Chip.Group>
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
