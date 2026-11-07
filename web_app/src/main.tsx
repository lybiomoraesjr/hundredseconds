import '@mantine/core/styles.css'

import { MantineProvider } from '@mantine/core'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppServicesProvider, type AppServices } from './application/AppServices'
import { SessionStore } from './application/auth/SessionStore'
import { QuestionGenerator } from './domain'
import { WebAudioBeeper } from './infrastructure/audio/WebAudioBeeper'
import { AuthApiClient } from './infrastructure/http/AuthApiClient'
import { HttpClient } from './infrastructure/http/HttpClient'
import { ScoreApiClient } from './infrastructure/http/ScoreApiClient'
import { HybridScoreGateway } from './infrastructure/score/HybridScoreGateway'
import { LocalScoreGateway } from './infrastructure/storage/LocalScoreGateway'
import { LocalSessionPersistence } from './infrastructure/storage/LocalSessionPersistence'
import { App } from './presentation/App'
import { messages } from './presentation/i18n/messages'
import { theme } from './presentation/theme'

// Composition root: concrete implementations are chosen here only
const sessionStore = new SessionStore(new LocalSessionPersistence())
const http = new HttpClient({
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
  onUnauthorized: () => sessionStore.clear(),
})
const services: AppServices = {
  scoreGateway: new HybridScoreGateway(
    new ScoreApiClient(http),
    new LocalScoreGateway({ playerName: messages.guestName }),
    sessionStore,
  ),
  authGateway: new AuthApiClient(http),
  sessionStore,
  beeper: new WebAudioBeeper(),
  questionGenerator: new QuestionGenerator(),
  now: () => Date.now(),
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <AppServicesProvider services={services}>
        <App />
      </AppServicesProvider>
    </MantineProvider>
  </StrictMode>,
)
