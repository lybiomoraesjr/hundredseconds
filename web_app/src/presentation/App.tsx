import { Container } from '@mantine/core'
import { useCallback, useEffect, useState } from 'react'
import { useAppServices } from '../application/AppServices'
import { useAuth } from '../application/auth/useAuth'
import type { FinishedMatch, ScoreSummary } from '../application/ports/ScoreGateway'
import { GameMode } from '../domain'
import { AuthModal } from './components/AuthModal'
import { HighscoresModal } from './components/HighscoresModal'
import type { SaveState } from './components/SaveStatusPanel'
import { GamePage } from './pages/GamePage'
import { HomePage } from './pages/HomePage'
import { ResultPage } from './pages/ResultPage'

type Screen =
  | { name: 'HOME' }
  /** gameId remounts the game on "play again" so all state starts fresh. */
  | { name: 'GAME'; gameId: number }
  | { name: 'RESULT'; match: FinishedMatch; isNewRecord: boolean; isGuest: boolean }

export function App() {
  const { scoreGateway, beeper } = useAppServices()
  const { session } = useAuth()
  const [mode, setMode] = useState<GameMode>(GameMode.EXPONENTIATION)
  const [screen, setScreen] = useState<Screen>({ name: 'HOME' })
  const [summary, setSummary] = useState<ScoreSummary | null>(null)
  const [saveState, setSaveState] = useState<SaveState>({ status: 'SAVING' })
  const [highscoresOpened, setHighscoresOpened] = useState(false)
  const [loginOpened, setLoginOpened] = useState(false)
  // Incremented after a match is saved to reload the summary
  const [summaryVersion, setSummaryVersion] = useState(0)
  const userId = session?.userId ?? null

  // Reload when the mode, the logged player or the saved results change
  useEffect(() => {
    let active = true
    scoreGateway.getSummary(mode)
      .then((result) => active && setSummary(result))
      .catch(() => active && setSummary(null))
    return () => {
      active = false
    }
  }, [mode, scoreGateway, summaryVersion, userId])

  const startGame = () => {
    beeper.unlock()
    setScreen({ name: 'GAME', gameId: Date.now() })
  }

  const handleFinished = useCallback(async (match: FinishedMatch) => {
    const previousBest = summary?.personalBest ?? null
    const isNewRecord = match.score > 0 && (previousBest === null || match.score > previousBest)
    setScreen({ name: 'RESULT', match, isNewRecord, isGuest: userId === null })
    setSaveState({ status: 'SAVING' })
    try {
      await scoreGateway.saveScore(match)
      setSaveState({ status: userId === null ? 'SAVED_LOCALLY' : 'SAVED' })
    } catch (error) {
      setSaveState({ status: 'FAILED', error })
    } finally {
      setSummaryVersion((version) => version + 1)
    }
  }, [scoreGateway, summary, userId])

  const submitGuestName = useCallback(async (name: string) => {
    if (screen.name !== 'RESULT') return
    await scoreGateway.submitGuestScore(screen.match, name)
    setSummaryVersion((version) => version + 1)
  }, [scoreGateway, screen])

  return (
    <Container size="md" py={{ base: 'md', sm: 'xl' }} px={{ base: 'md', sm: 'lg' }}>
      {screen.name === 'HOME' && (
        <HomePage mode={mode} summary={summary} onModeChange={setMode} onStart={startGame}
          onOpenHighscores={() => setHighscoresOpened(true)} onOpenLogin={() => setLoginOpened(true)} />
      )}
      {screen.name === 'GAME' && (
        <GamePage key={screen.gameId} mode={mode} personalBest={summary?.personalBest ?? null}
          onFinished={handleFinished} />
      )}
      {screen.name === 'RESULT' && (
        <ResultPage match={screen.match} isNewRecord={screen.isNewRecord} saveState={saveState}
          isGuest={screen.isGuest} onSubmitGuestName={submitGuestName} onPlayAgain={startGame}
          onBackHome={() => setScreen({ name: 'HOME' })} onOpenHighscores={() => setHighscoresOpened(true)} />
      )}
      {highscoresOpened && <HighscoresModal mode={mode} onClose={() => setHighscoresOpened(false)} />}
      {loginOpened && <AuthModal onClose={() => setLoginOpened(false)} />}
    </Container>
  )
}
