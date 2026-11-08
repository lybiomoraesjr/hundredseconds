import { Button, Center, Group, Stack, Text, TextInput } from '@mantine/core'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useGame } from '../../application/game/useGame'
import type { FinishedMatch } from '../../application/ports/ScoreGateway'
import { GameMode, isStateQuestion, type Question, type StateGameMode } from '../../domain'
import { preloadFlags } from '../components/flagImages'
import { GameBoard } from '../components/GameBoard'
import { MathExpression } from '../components/MathExpression'
import { StateFlag } from '../components/StateFlag'
import { StarBar } from '../components/StarBar'
import { TimerBar } from '../components/TimerBar'
import { messages } from '../i18n/messages'
import classes from './GamePage.module.css'

interface AnswerInputConfig {
  readonly className?: string
  readonly inputMode: 'numeric' | 'text'
  readonly placeholder?: string
  readonly maxLength?: number
  readonly autoCapitalize: 'off' | 'characters'
  /** Cleans what the player types before it reaches the box. */
  readonly sanitize: (value: string) => string
}

/** How the answer box behaves in each game. */
function answerInputFor(mode: GameMode): AnswerInputConfig {
  switch (mode) {
    case GameMode.STATE_FLAGS:
      return {
        className: classes.textAnswer,
        inputMode: 'text',
        placeholder: messages.game.flagAnswerPlaceholder,
        autoCapitalize: 'off',
        sanitize: (value) => value,
      }
    case GameMode.STATE_CAPITALS:
      return {
        className: classes.textAnswer,
        inputMode: 'text',
        placeholder: messages.game.capitalAnswerPlaceholder,
        autoCapitalize: 'off',
        sanitize: (value) => value,
      }
    case GameMode.CAPITAL_DEMONYMS:
      return {
        className: classes.textAnswer,
        inputMode: 'text',
        placeholder: messages.game.demonymAnswerPlaceholder,
        autoCapitalize: 'off',
        sanitize: (value) => value,
      }
    case GameMode.STATE_ABBREVIATIONS:
      return {
        inputMode: 'text',
        placeholder: messages.game.abbreviationAnswerPlaceholder,
        maxLength: 2,
        autoCapitalize: 'characters',
        sanitize: (value) => value.replace(/[^a-zA-Z]/g, '').toUpperCase(),
      }
    default:
      return { inputMode: 'numeric', autoCapitalize: 'off', sanitize: (value) => value.replace(/\D/g, '') }
  }
}

interface GamePageProps {
  mode: GameMode
  personalBest: number | null
  onFinished: (match: FinishedMatch) => void
}

export function GamePage({ mode, personalBest, onFinished }: GamePageProps) {
  const { state, stars, submit, clearFeedback } = useGame(mode, onFinished)
  const [answer, setAnswer] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const { status, session } = state
  const isRevealing = session.phase === 'REVEALING_ANSWER'
  const isRetry = state.lastOutcome === 'WRONG_RETRY'
  const best = Math.max(personalBest ?? 0, session.score)
  const isFlagGame = mode === GameMode.STATE_FLAGS
  const input = answerInputFor(mode)

  // Flags are downloaded during the countdown, so none of them pops in late
  useEffect(() => {
    if (isFlagGame) preloadFlags()
  }, [isFlagGame])

  // Keep the cursor in the answer box all the time
  useEffect(() => {
    if (status === 'PLAYING' && !isRevealing) inputRef.current?.focus()
  }, [status, isRevealing, session.currentQuestion])

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    submit(answer)
    setAnswer('')
    inputRef.current?.focus()
  }

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
    <GameBoard footer={<StarBar stars={stars} />}>
      <Group justify="space-between" align="flex-start">
        <TimerBar secondsLeft={state.secondsLeft} fraction={state.timeFraction} />
        <Stack gap={0} align="flex-end">
          <Text fw={700} c="white" data-testid="score">{messages.game.score(session.score)}</Text>
          <Text size="sm" c="white">{messages.game.best(best)}</Text>
        </Stack>
      </Group>

      <Stack align="center" justify="center" gap="lg" flex={1} py="xl">
        <QuestionPrompt question={session.currentQuestion} />

        {!isRevealing && (
          <form onSubmit={handleSubmit}>
            <Group gap="sm" align="center" justify="center">
              <TextInput
                key={state.mistakeCount}
                ref={inputRef}
                className={`${classes.answerInput} ${input.className ?? ''} ${isRetry ? classes.shake : ''}`}
                aria-label={messages.game.answerLabel}
                value={answer}
                onChange={(event) => {
                  setAnswer(input.sanitize(event.currentTarget.value))
                  clearFeedback()
                }}
                error={isRetry}
                inputMode={input.inputMode}
                placeholder={input.placeholder}
                maxLength={input.maxLength}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize={input.autoCapitalize}
                spellCheck={false}
                autoFocus
                disabled={status !== 'PLAYING'}
                styles={isRetry ? { input: { borderWidth: 4 } } : undefined}
              />
              <Button type="submit" size="lg" color="green.6" disabled={status !== 'PLAYING'}>
                {messages.game.submit}
              </Button>
            </Group>
          </form>
        )}
        <Text c="white" fw={600} mih={24} aria-live="polite">{isRetry ? messages.game.tryAgain : ''}</Text>
      </Stack>

      {isRevealing && (
        <div className={classes.reveal} role="alert">
          <Text size="xl" fw={600}>{messages.game.correctAnswerWas}</Text>
          <RevealedAnswer question={session.currentQuestion} />
        </div>
      )}
    </GameBoard>
  )
}

/** Question shown above the prompt text in the state games that display text (every one but flags). */
const TEXT_PROMPT_QUESTIONS: Record<StateGameMode, string> = {
  [GameMode.STATE_FLAGS]: messages.game.flagQuestion,
  [GameMode.STATE_ABBREVIATIONS]: messages.game.abbreviationQuestion,
  [GameMode.STATE_CAPITALS]: messages.game.capitalQuestion,
  [GameMode.CAPITAL_DEMONYMS]: messages.game.demonymQuestion,
}

function QuestionPrompt({ question }: { question: Question }) {
  if (isStateQuestion(question)) {
    if (question.mode === GameMode.STATE_FLAGS) {
      return (
        <Stack align="center" gap="sm" data-testid="question">
          <Text c="white" fw={600} size="lg">{TEXT_PROMPT_QUESTIONS[question.mode]}</Text>
          <StateFlag stateCode={question.stateCode} />
        </Stack>
      )
    }
    return (
      <Stack align="center" gap="sm" data-testid="question">
        <Text c="white" fw={600} size="lg" ta="center">{TEXT_PROMPT_QUESTIONS[question.mode]}</Text>
        <Text className={classes.promptText} c="white" data-testid="prompt">{question.prompt}</Text>
      </Stack>
    )
  }
  return (
    <Text component="div" className={classes.expression} c="white" data-testid="question">
      <MathExpression question={question} /> =
    </Text>
  )
}

function RevealedAnswer({ question }: { question: Question }) {
  if (isStateQuestion(question)) {
    if (question.mode === GameMode.STATE_FLAGS) {
      return (
        <Stack align="center" gap="md">
          <StateFlag stateCode={question.stateCode} size="lg" />
          <Text className={classes.revealName} data-testid="revealed-answer">{question.answer}</Text>
        </Stack>
      )
    }
    return (
      <Stack align="center" gap={0}>
        <Text className={classes.revealName}>{question.prompt}</Text>
        {/* Names can be long ("Florianópolis"), so they use a smaller size than the two-letter abbreviation */}
        <Text className={question.mode === GameMode.STATE_ABBREVIATIONS ? classes.revealExpression : classes.revealLongAnswer}
          data-testid="revealed-answer">{question.answer}</Text>
      </Stack>
    )
  }
  return (
    <div className={classes.revealExpression} data-testid="revealed-answer">
      <MathExpression question={question} /> = {question.answer}
    </div>
  )
}
