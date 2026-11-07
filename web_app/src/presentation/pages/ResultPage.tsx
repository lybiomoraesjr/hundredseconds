import { Badge, Button, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import type { FinishedMatch } from '../../application/ports/ScoreGateway'
import { starsFor } from '../../domain'
import { GameBoard } from '../components/GameBoard'
import { StarBar } from '../components/StarBar'
import { messages } from '../i18n/messages'

interface ResultPageProps {
  match: FinishedMatch
  isNewRecord: boolean
  onPlayAgain: () => void
  onBackHome: () => void
  onOpenHighscores: () => void
}

function Stat({ label, value, testId }: { label: string; value: number; testId: string }) {
  return (
    <Stack gap={0} align="center">
      <Text size="sm" c="white">{label}</Text>
      <Text fz={44} fw={800} c="white" lh={1.1} data-testid={testId}>{value}</Text>
    </Stack>
  )
}

export function ResultPage({ match, isNewRecord, onPlayAgain, onBackHome, onOpenHighscores }: ResultPageProps) {
  const stars = starsFor(match.score)
  return (
    <GameBoard footer={<StarBar stars={stars} />}>
      <Stack align="center" justify="center" gap="lg" flex={1}>
        <Title order={2} c="white">{messages.result.title}</Title>
        <Text c="white">{messages.modes[match.mode]}</Text>
        {isNewRecord && <Badge size="lg" color="yellow.5" c="dark">{messages.result.newRecord}</Badge>}
        <SimpleGrid cols={3} spacing="xl">
          <Stat label={messages.result.score} value={match.score} testId="result-score" />
          <Stat label={messages.result.stars} value={stars} testId="result-stars" />
          <Stat label={messages.result.wrongAnswers} value={match.wrongAnswers} testId="result-wrong" />
        </SimpleGrid>
        <Group justify="center" mt="md">
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
