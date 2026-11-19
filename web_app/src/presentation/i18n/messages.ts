import { GameMode, isRulersMode, LeaderboardPeriod } from '../../domain'

const modes = {
  [GameMode.EXPONENTIATION]: 'Potenciação',
  [GameMode.ROOT_EXTRACTION]: 'Radiciação',
  [GameMode.STATE_FLAGS]: 'Bandeiras',
  [GameMode.STATE_ABBREVIATIONS]: 'Siglas',
  [GameMode.STATE_CAPITALS]: 'Capitais',
  [GameMode.CAPITAL_DEMONYMS]: 'Gentílicos (capitais)',
  [GameMode.STATE_MAP]: 'Estados',
  [GameMode.STATE_DEMONYMS]: 'Gentílicos (estados)',
  [GameMode.RULERS_EMPIRE]: 'Império',
  [GameMode.RULERS_OLD_REPUBLIC]: 'República Velha',
  [GameMode.RULERS_VARGAS_ERA]: 'De Vargas a Jango',
  [GameMode.RULERS_MILITARY]: 'Ditadura Militar',
  [GameMode.RULERS_NEW_REPUBLIC]: 'Nova República',
  [GameMode.RULERS_ALL]: 'Todos',
} as const satisfies Record<GameMode, string>

/** "0:42,3" (minutes, seconds and tenths). */
function formatDuration(durationMs: number): string {
  const tenths = Math.floor(durationMs / 100)
  const minutes = Math.floor(tenths / 600)
  const seconds = Math.floor((tenths % 600) / 10)
  return `${minutes}:${String(seconds).padStart(2, '0')},${tenths % 10}`
}

/** User-facing texts (pt-BR). Kept apart from the code so naming stays in English. */
export const messages = {
  appTitle: '100 segundos',
  appTagline: 'Quantas perguntas consegue responder dentro de 100 segundos? Faça o teste!',
  /** Chip labels; the rulers eras only make sense under their group title. */
  modes,
  /** Full name of a game, shown on the result and on the highscores. */
  modeTitle: (mode: GameMode) => (isRulersMode(mode) ? `Governantes: ${modes[mode]}` : modes[mode]),
  modeSelectorLabel: 'Modalidade',
  modeGroups: {
    math: 'Matemática',
    geography: 'Geografia do Brasil',
    history: 'Governantes do Brasil',
  },
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
    flagQuestion: 'De qual estado é esta bandeira?',
    // Must not reveal the answer
    flagAlt: 'Bandeira de um estado brasileiro',
    flagAnswerPlaceholder: 'Nome do estado',
    abbreviationQuestion: 'Qual é a sigla deste estado?',
    abbreviationAnswerPlaceholder: 'UF',
    capitalQuestion: 'Qual é a capital deste estado?',
    capitalAnswerPlaceholder: 'Nome da capital',
    demonymQuestion: 'Qual é o gentílico de quem nasce nesta capital?',
    demonymAnswerPlaceholder: 'Gentílico',
    stateDemonymQuestion: 'Qual é o gentílico de quem nasce neste estado?',
    mapQuestion: 'Qual é o estado destacado no mapa?',
    // Must not reveal the answer
    mapAlt: 'Mapa do Brasil com um estado destacado',
    mapCredit: 'Mapa: MapSVG / Victor Cazanave (CC BY 4.0)',
    rulerQuestion: 'Quem governou o Brasil neste período?',
    notInauguratedQuestion: 'Quem foi eleito presidente neste ano, mas não tomou posse?',
    starsLabel: (stars: number) => `${stars} de 10 estrelas`,
  },
  result: {
    title: 'Fim do tempo!',
    rulersTitle: 'Fim do quiz!',
    correctAnswers: 'Acertos',
    outOf: (score: number, total: number) => `${score}/${total}`,
    time: 'Tempo',
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
    time: 'Tempo',
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
  history: {
    period: (from: string, to: string) => `${from} a ${to}`,
    sinceUntilToday: (from: string) => `${from} até hoje`,
  },
  rulers: {
    elapsed: (durationMs: number) => `Tempo: ${formatDuration(durationMs)}`,
    progress: (current: number, total: number) => `Pergunta ${current} de ${total}`,
    correctCount: (score: number) => `Acertos: ${score}`,
    optionsLabel: 'Alternativas',
    correct: 'Acertou!',
    wrong: (answer: string) => `Errou! Era ${answer}.`,
  },
  formatDuration,
  guestName: 'Você',
  auth: {
    login: 'Entrar',
    logout: 'Sair',
    register: 'Criar conta',
    greeting: (username: string) => `Olá, ${username}!`,
    username: 'Nome / Nickname',
    email: 'E-mail',
    password: 'Senha',
    submitLogin: 'Entrar',
    submitRegister: 'Criar conta e entrar',
    guestHint: 'Sem conta você também pode jogar: o seu recorde fica salvo neste navegador.',
    validation: {
      usernameRequired: 'Informe um nome.',
      usernameTooLong: 'Use no máximo 50 caracteres.',
      emailInvalid: 'Informe um e-mail válido.',
      passwordTooShort: 'A senha precisa ter pelo menos 6 caracteres.',
      passwordTooLong: 'A senha pode ter no máximo 72 caracteres.',
    },
  },
  saving: {
    saving: 'Salvando resultado…',
    saved: 'Resultado salvo no ranking!',
    savedLocally: 'Resultado salvo neste navegador.',
    failed: 'Não foi possível salvar no ranking.',
    guestPrompt: 'Quer aparecer no ranking global? Informe o seu nome:',
    guestNameLabel: 'Seu nome',
    guestSubmit: 'Enviar para o ranking',
    guestNameRequired: 'Informe um nome com até 50 caracteres.',
  },
  errors: {
    VALIDATION_ERROR: 'Alguns dados estão inválidos. Confira os campos.',
    INVALID_PLAYER_NAME: 'Nome inválido. Use de 1 a 50 caracteres.',
    INVALID_EMAIL: 'E-mail inválido.',
    INVALID_PASSWORD: 'A senha precisa ter pelo menos 6 caracteres.',
    IMPLAUSIBLE_SCORE: 'Este resultado não pôde ser aceito.',
    EMAIL_ALREADY_IN_USE: 'Este e-mail já está cadastrado.',
    USERNAME_ALREADY_IN_USE: 'Este nome já está em uso. Escolha outro.',
    INVALID_CREDENTIALS: 'E-mail ou senha incorretos.',
    AUTHENTICATION_REQUIRED: 'A sua sessão expirou. Entre novamente.',
    USER_NOT_FOUND: 'Usuário não encontrado. Entre novamente.',
    CONFLICT: 'Estes dados já estão em uso.',
    NETWORK_ERROR: 'Não foi possível conectar ao servidor. Verifique a sua conexão.',
    UNKNOWN_ERROR: 'Algo deu errado. Tente novamente.',
  },
  leaderboardError: 'Não foi possível carregar o ranking.',
} as const
