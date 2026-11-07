import { GameMode, LeaderboardPeriod } from '../../domain'

/** User-facing texts (pt-BR). Kept apart from the code so naming stays in English. */
export const messages = {
  appTitle: '100 segundos',
  appTagline: 'Quantas perguntas consegue responder dentro de 100 segundos? Faça o teste!',
  modes: {
    [GameMode.EXPONENTIATION]: 'Potenciação',
    [GameMode.ROOT_EXTRACTION]: 'Radiciação',
  },
  modeSelectorLabel: 'Modalidade',
  summary: {
    personalBest: 'O seu resultado mais alto:',
    todayBest: 'Resultado mais alto de hoje:',
    yearBest: 'Resultado mais alto deste ano:',
    empty: '–',
  },
  start: 'Início',
  highscores: 'Highscores',
  game: {
    time: (seconds: number) => `Tempo: ${seconds}`,
    score: (score: number) => `Resultado: ${score}`,
    best: (best: number) => `Resultado mais alto: ${best}`,
    answerLabel: 'Sua resposta',
    submit: 'Respondida',
    tryAgain: 'Errou! Tente mais uma vez.',
    correctAnswerWas: 'A resposta correta é',
    starsLabel: (stars: number) => `${stars} de 10 estrelas`,
  },
  result: {
    title: 'Fim do tempo!',
    score: 'Resultado',
    wrongAnswers: 'Respostas erradas',
    stars: 'Estrelas',
    newRecord: 'Novo recorde pessoal!',
    playAgain: 'Jogar novamente',
    backHome: 'Início',
  },
  leaderboard: {
    tabs: {
      [LeaderboardPeriod.USER]: 'Os seus resultados',
      [LeaderboardPeriod.DAY]: 'Dia',
      [LeaderboardPeriod.WEEK]: 'Semana',
      [LeaderboardPeriod.YEAR]: 'Ano',
    },
    titles: {
      [LeaderboardPeriod.USER]: 'Os seus resultados mais altos',
      [LeaderboardPeriod.DAY]: 'Resultado mais alto de hoje',
      [LeaderboardPeriod.WEEK]: 'Resultado mais alto da semana',
      [LeaderboardPeriod.YEAR]: 'Resultado mais alto deste ano',
    },
    name: 'Nome',
    score: 'Resultado',
    empty: 'Ainda não há resultados.',
    loading: 'Carregando…',
    back: 'Voltar',
    close: 'Fechar',
  },
  math: {
    power: (base: number, exponent: number) => `${base} elevado a ${exponent}`,
    root: (radicand: number, index: number) => {
      const names: Record<number, string> = { 2: 'raiz quadrada', 3: 'raiz cúbica', 4: 'raiz quarta', 5: 'raiz quinta' }
      return `${names[index] ?? `raiz de índice ${index}`} de ${radicand}`
    },
  },
  guestName: 'Você',
} as const
