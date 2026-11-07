import '@mantine/core/styles.css'

import { MantineProvider } from '@mantine/core'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppServicesProvider, type AppServices } from './application/AppServices'
import { QuestionGenerator } from './domain'
import { WebAudioBeeper } from './infrastructure/audio/WebAudioBeeper'
import { LocalScoreGateway } from './infrastructure/storage/LocalScoreGateway'
import { App } from './presentation/App'
import { messages } from './presentation/i18n/messages'
import { theme } from './presentation/theme'

// Composition root: concrete implementations are chosen here only
const services: AppServices = {
  scoreGateway: new LocalScoreGateway({ playerName: messages.guestName }),
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
