import { Button, Center, Group, SimpleGrid, Stack, Text } from '@mantine/core'
import type { FinishedMatch } from '../../application/ports/ScoreGateway'
import { useRulersQuiz } from '../../application/rulers/useRulersQuiz'
import { currentRulersQuestion, type RulersGameMode, type RulersQuizQuestion } from '../../domain'
import { GameBoard } from '../components/GameBoard'
import { messages } from '../i18n/messages'
import { rulerHeading, rulerPrompt } from '../i18n/rulerPrompt'
import classes from './GamePage.module.css'

interface RulersQuizPageProps {
  mode: RulersGameMode
  onFinished: (match: FinishedMatch) => void
}

/** Time trial: every ruler of the era, in chronological order, answered by picking one of four names. */
export function RulersQuizPage({ mode, onFinished }: RulersQuizPageProps) {
  const { state, choose } = useRulersQuiz(mode, onFinished)
  const { status, quiz } = state
  const question = currentRulersQuestion(quiz)

  if (status === 'COUNTDOWN') {
    return (
      <GameBoard>
        <Center flex={1}>
          <Text className={classes.countdown} c="white" aria-live="assertive">{state.countdown}</Text>
        </Center>
      </GameBoard>
    )
  }

  return (
    <GameBoard>
      <Group justify="space-between" align="flex-start">
        <Text fw={700} c="white" data-testid="elapsed">{messages.rulers.elapsed(state.elapsedMs)}</Text>
        <Stack gap={0} align="flex-end">
          <Text fw={700} c="white" data-testid="progress">
            {messages.rulers.progress(Math.min(quiz.index + 1, quiz.questions.length), quiz.questions.length)}
          </Text>
          <Text size="sm" c="white" data-testid="score">{messages.rulers.correctCount(quiz.score)}</Text>
        </Stack>
      </Group>

      {question && (
        <Stack align="center" justify="center" gap="lg" flex={1} py="xl">
          <Stack align="center" gap="sm" data-testid="question">
            <Text c="white" fw={600} size="lg" ta="center">{rulerHeading(question.ruler)}</Text>
            <Text className={classes.promptText} c="white" data-testid="prompt">{rulerPrompt(question.ruler)}</Text>
          </Stack>
          <Options question={question} chosen={quiz.chosen} onChoose={choose} />
          <Text c="white" fw={600} mih={24} aria-live="polite" data-testid="feedback">
            {quiz.chosen === null ? ''
              : quiz.chosen === question.ruler.name ? messages.rulers.correct
                : messages.rulers.wrong(question.ruler.name)}
          </Text>
        </Stack>
      )}
    </GameBoard>
  )
}

function Options({ question, chosen, onChoose }: {
  question: RulersQuizQuestion
  chosen: string | null
  onChoose: (name: string) => void
}) {
  const answered = chosen !== null
  const colorOf = (option: string) => {
    if (!answered) return 'gray.0'
    if (option === question.ruler.name) return 'green.6'
    return option === chosen ? 'red.7' : 'gray.0'
  }
  return (
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm" w="min(36rem, 100%)" role="group"
      aria-label={messages.rulers.optionsLabel}>
      {question.options.map((option) => (
        <Button key={`${question.ruler.id}:${option}`} size="lg" h="auto" mih={56} py="xs" radius="md"
          color={colorOf(option)} c={answered && colorOf(option) !== 'gray.0' ? 'white' : 'dark.9'}
          styles={{ label: { whiteSpace: 'normal', textAlign: 'center' } }}
          // Keep every option readable after the choice; clicks are ignored by the quiz anyway
          style={answered && colorOf(option) === 'gray.0' ? { opacity: 0.6 } : undefined}
          aria-disabled={answered} onClick={() => onChoose(option)}>
          {option}
        </Button>
      ))}
    </SimpleGrid>
  )
}
