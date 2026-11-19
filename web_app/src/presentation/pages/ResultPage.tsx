import { Badge, Button, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import type { FinishedMatch } from '../../application/ports/ScoreGateway'
import { isRulersMode, rulersOf, starsFor } from '../../domain'
import { GameBoard } from '../components/GameBoard'
import { SaveStatusPanel, type SaveState } from '../components/SaveStatusPanel'
import { StarBar } from '../components/StarBar'
import { messages } from '../i18n/messages'

interface ResultPageProps {
  match: FinishedMatch
  isNewRecord: boolean
  saveState: SaveState
  isGuest: boolean
  onSubmitGuestName: (name: string) => Promise<void>
  onPlayAgain: () => void
  onBackHome: () => void
  onOpenHighscores: () => void
}

function Stat({ label, value, testId }: { label: string; value: number | string; testId: string }) {
  return (
    <Stack gap={0} align="center">
      <Text size="sm" c="white">{label}</Text>
      <Text fz={44} fw={800} c="white" lh={1.1} data-testid={testId}>{value}</Text>
    </Stack>
  )
}

export function ResultPage({
  match, isNewRecord, saveState, isGuest, onSubmitGuestName, onPlayAgain, onBackHome, onOpenHighscores,
}: ResultPageProps) {
  const stars = starsFor(match.score)
  const isRulers = isRulersMode(match.mode)
  return (
    // Stars belong to the 100 second games; the rulers time trial is scored by right answers and time
    <GameBoard footer={isRulers ? undefined : <StarBar stars={stars} />}>
      <Stack align="center" justify="center" gap="lg" flex={1}>
        <Title order={2} c="white">{isRulers ? messages.result.rulersTitle : messages.result.title}</Title>
        <Text c="white">{messages.modeTitle(match.mode)}</Text>
        {isNewRecord && <Badge size="lg" color="yellow.5" c="dark">{messages.result.newRecord}</Badge>}
        {isRulers ? (
          <SimpleGrid cols={3} spacing="xl">
            <Stat label={messages.result.correctAnswers} testId="result-score"
              value={messages.result.outOf(match.score, rulersOf(match.mode).length)} />
            <Stat label={messages.result.time} value={messages.formatDuration(match.durationMs ?? 0)}
              testId="result-time" />
            <Stat label={messages.result.wrongAnswers} value={match.wrongAnswers} testId="result-wrong" />
          </SimpleGrid>
        ) : (
          <SimpleGrid cols={3} spacing="xl">
            <Stat label={messages.result.score} value={match.score} testId="result-score" />
            <Stat label={messages.result.stars} value={stars} testId="result-stars" />
            <Stat label={messages.result.wrongAnswers} value={match.wrongAnswers} testId="result-wrong" />
          </SimpleGrid>
        )}
        <SaveStatusPanel state={saveState} isGuest={isGuest} onSubmitGuestName={onSubmitGuestName} />
        <Group justify="center" mt="xs">
          <Button size="lg" color="green.6" onClick={onPlayAgain}>{messages.result.playAgain}</Button>
          <Button size="lg" variant="white" color="orange.8" onClick={onBackHome}>{messages.result.backHome}</Button>
        </Group>
      </Stack>
      <Group justify="flex-end">
        <Button variant="white" color="orange.8" onClick={onOpenHighscores}>{messages.highscores}</Button>
      </Group>
    </GameBoard>
  )
}
