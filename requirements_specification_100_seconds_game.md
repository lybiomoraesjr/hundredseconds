# Documento de Requisitos do Sistema: "100 Segundos - Potenciação e Radiciação"

## 1. Visão Geral do Projeto
O objetivo deste projeto é desenvolver uma aplicação web de perguntas e respostas rápidas de matemática (estilo *time-attack*), inspirada no modo "100 segundos" do site *Tabuada de Multiplicar*. Em vez de multiplicação, o foco pedagógico será nas principais **potenciações** e **radiciações** ensinadas no período escolar. O jogador terá $100$ segundos para responder ao maior número possível de questões, contando com progressão dinâmica de dificuldade, sistema de recompensas por estrelas, histórico pessoal e tabelas de classificação (*Highscores*).

### Stack Tecnológica
* **Frontend:** React.js com TypeScript (inicializado com Vite) e **Mantine** como biblioteca de componentes e estilização.
* **Backend:** Java com Spring Boot (Spring Web, Spring Security/JWT, Spring Data JPA).
* **Banco de Dados:** PostgreSQL.
* **Infraestrutura:** Docker e Docker Compose para containerização de todos os serviços (frontend, backend e banco de dados).

### Arquitetura
* O projeto seguirá os princípios da **Clean Architecture** (Arquitetura Limpa), tanto no backend quanto no frontend (ver seção 8).

### Convenções de Código e Idioma
* **Classes, interfaces, enums, métodos, variáveis e constantes:** sempre em **inglês**.
* **Nomes de arquivos e pastas:** sempre em **inglês** (inclusive arquivos `.md`).
* **Comentários no código:** sempre em **inglês**.
* **Arquivos de documentação (`.md`):** são os **únicos** que podem ter conteúdo em **português**; o nome do arquivo, porém, deve estar em inglês.
* Textos exibidos ao usuário na interface (rótulos, mensagens) permanecem em português, mas devem ficar isolados (ex: arquivo de constantes/i18n), sem afetar a nomenclatura do código.

---

## 2. Regras de Negócio e Mecânicas de Jogo (Game Design)

### 2.1. Modalidades de Jogo
Antes de iniciar a partida, o usuário deverá escolher obrigatoriamente uma entre oito modalidades, exibidas como *chips* agrupados em **Matemática** e **Geografia do Brasil** (os chips quebram linha em telas pequenas):
1. **Apenas Potenciação:** Questões no formato $a^n = ?$
2. **Apenas Radiciação:** Questões no formato $\sqrt[n]{a} = ?$
3. **Bandeiras dos estados** (`STATE_FLAGS`): aparece a bandeira de um estado brasileiro (26 estados + DF) e o jogador digita o nome do estado. Regras próprias:
   * As bandeiras saem em ordem aleatória e **nenhuma se repete até as 27 aparecerem**; depois começa uma nova rodada (sem repetir a última bandeira em seguida).
   * A resposta é comparada **ignorando maiúsculas/minúsculas, acentos e espaços extras** ("sao paulo" = "São Paulo"). Apenas o nome completo é aceito (a sigla não vale).
   * **Uma única tentativa:** ao errar, a bandeira e o nome correto cobrem a tela por **1,5 segundo** (o cronômetro continua correndo) e a próxima bandeira aparece.
   * Duração (100 s), estrelas, contador de erros e rankings funcionam como nas outras modalidades. Não há níveis de dificuldade.
   * Imagens em `web_app/public/flags/<sigla>.webp`.
4. **Siglas dos estados** (`STATE_ABBREVIATIONS`): aparece o nome de um estado (26 estados + DF) e o jogador digita a sigla (ex.: Minas Gerais → `MG`). Segue as mesmas regras das Bandeiras (27 por rodada sem repetição, uma única tentativa, revelação de 1,5 s com o nome e a sigla). O campo aceita apenas letras, no máximo 2, convertidas para maiúsculas.
5. **Capitais dos estados** (`STATE_CAPITALS`): aparece o nome de um estado e o jogador digita a capital (ex.: Minas Gerais → Belo Horizonte; para o Distrito Federal, **Brasília**). Mesmas regras das Bandeiras, com a mesma comparação que ignora acentos, maiúsculas e espaços extras.
6. **Gentílicos das capitais** (`CAPITAL_DEMONYMS`, rótulo "Gentílicos (capitais)"): aparece o nome de uma capital e o jogador digita o gentílico de quem nasce nela (ex.: Salvador → soteropolitano). Mesmas regras das Bandeiras, com tolerâncias extras na comparação:
   * Hífens e espaços são ignorados ("belo horizontino" e "belohorizontino" = "belo-horizontino").
   * A forma feminina é aceita para gentílicos terminados em "o" ("soteropolitana").
   * Formas alternativas oficiais também valem: manauara/manauense, soteropolitano/salvadorense, ludovicense/são-luisense, aracajuano/aracajuense. Ao errar, a primeira forma é a exibida.
   * Gentílicos do estado não valem quando diferem do da capital (Salvador ≠ "baiano", São Paulo ≠ "paulista"). Apelidos informais (manezinho, papa-jerimum) e "capixaba" para Vitória também não.
7. **Estados no mapa** (`STATE_MAP`, rótulo "Estados"): aparece o mapa do Brasil com um estado destacado e o jogador digita o nome do estado. Mesmas regras das Bandeiras. Estados pequenos demais para ver (DF, SE, AL) ganham um círculo em volta. O mapa vem de `@svg-maps/brazil` (Victor Cazanave, baseado no MapSVG, licença **CC BY 4.0**); o crédito aparece abaixo do mapa, como a licença exige. Os dados ficam em `brazilMapData.ts`, gerado por `web_app/scripts/generate_brazil_map.py`, e só são baixados por quem joga esse modo.
8. **Gentílicos dos estados** (`STATE_DEMONYMS`, rótulo "Gentílicos (estados)"): aparece o nome de um estado e o jogador digita o gentílico (ex.: Bahia → baiano). Mesmas tolerâncias dos Gentílicos das capitais (hífens/espaços, feminino, formas alternativas oficiais: acriano/acreano, capixaba/espírito-santense, sul-mato-grossense/mato-grossense-do-sul, potiguar/norte-rio-grandense/rio-grandense-do-norte, gaúcho/sul-rio-grandense/rio-grandense-do-sul, rondoniense/rondoniano, catarinense/barriga-verde, sergipano/sergipense). O gentílico da capital não vale quando difere do estado (São Paulo ≠ "paulistano", Rio de Janeiro ≠ "carioca"). Para o Distrito Federal, "brasiliense".

*(Nota: Os rankings e recordes devem ser registrados e exibidos separadamente para cada modalidade).*

### 2.2. Fluxo da Partida e Tempo
* **Contagem Regressiva Inicial:** Ao clicar em "Início", a tela limpa e exibe uma contagem regressiva centralizada ($3, 2, 1$) antes de liberar a primeira questão e iniciar o cronômetro. Cada número da contagem emite um *beep* curto e, no momento em que a partida começa, toca um **som diferente** (mais agudo e mais longo).
* **Duração:** A partida dura exatamente $100$ segundos.
* **Barra de Progresso:** Uma barra superior verde diminui proporcionalmente ao tempo restante, acompanhada do texto `Tempo: X`.
* **Alerta Sonoro:** Quando faltarem $10$ segundos, o sistema deve emitir **um único** sinal sonoro (*beep*) indicando que o tempo está acabando.
* **Submissão de Resposta:** 
  * O foco do cursor (*autofocus*) deve permanecer sempre na caixa de texto central.
  * O jogador digita os números no teclado e pressiona a tecla `Enter` (ou clica no botão "Respondida") para submeter.
  * **Acerto:** Soma $+1$ ao resultado atual, limpa o campo de texto imediatamente e gera a próxima questão.
  * **Erro (1ª tentativa):** A caixa de texto recebe uma **borda vermelha**, o campo é limpo e o jogador pode tentar **mais uma vez** a mesma questão.
  * **Erro (2ª tentativa):** A caixa de texto desaparece e a **resposta correta é exibida cobrindo toda a tela por $1$ segundo**; em seguida uma nova questão é gerada (sem pontuar). O cronômetro **continua correndo** durante esse segundo, ou seja, o jogador **perde esse segundo** de propósito.
  * **Contador de erros:** Cada resposta errada submetida soma $+1$ ao contador `wrongAnswers` da partida (uma questão pode gerar até $2$ erros). Submissões vazias são ignoradas e não contam como erro.
  * **Fim da partida:** Após os $100$ segundos é exibida uma tela de resultado com a quantidade de acertos, estrelas e **quantidade de respostas erradas**.

### 2.3. Sistema de Estrelas
* Na parte inferior da tela do jogo, existem $10$ espaços para estrelas (inicialmente brancas/vazias).
* A cada **$10$ respostas corretas**, o jogador ganha **$1$ estrela** (que fica preenchida/amarela) e toca um **som curto de recompensa** (duas notas ascendentes), em todas as modalidades.
* O limite máximo é de **$10$ estrelas** (atingido ao alcançar $100$ respostas corretas).
* O jogador pode continuar respondendo e pontuando normalmente acima de $100$ acertos, mas não ganhará estrelas adicionais.

### 2.4. Progressão de Dificuldade (Curva de Aprendizado)
O gerador de questões deve se basear na pontuação atual (`score`) da partida em andamento para sortear os problemas matemáticos, dividindo-se em 3 níveis:

#### Nível 1: Fácil (De $0$ a $25$ acertos)
* **Potenciação:** 
  * Bases $0, 1$ e $10$ com expoentes simples (ex: $0^2, 1^4, 10^2, 10^3$).
  * Qualquer base de $0$ a $10$ elevada a $0$ ou $1$ (ex: $0^0 = 1$, $7^0 = 1$, $9^1 = 9$).
  * Quadrados perfeitos básicos de $2^2$ até $5^2$.
* **Radiciação:**
  * Raízes quadradas exatas iniciais: $\sqrt{0}, \sqrt{1}, \sqrt{4}, \sqrt{9}, \sqrt{16}, \sqrt{25}$ e $\sqrt{100}$.

#### Nível 2: Médio / Padrão Escolar (De $26$ a $95$ acertos)
* **Potenciação:**
  * Quadrados perfeitos de $6^2$ até $10^2$.
  * Cubos perfeitos básicos: $2^3, 3^3, 4^3, 5^3$.
  * Potências clássicas de base $2$ ($2^4, 2^5, 2^6$) e base $3$ ($3^4$).
* **Radiciação:**
  * Raízes quadradas de $\sqrt{36}$ até $\sqrt{100}$.
  * Raízes cúbicas exatas: $\sqrt[3]{0}, \sqrt[3]{1}, \sqrt[3]{8}, \sqrt[3]{27}, \sqrt[3]{64}, \sqrt[3]{125}, \sqrt[3]{1000}$.
  * Raízes de índices maiores simples: $\sqrt[4]{16}, \sqrt[5]{32}$.

#### Nível 3: Avançado (Acima de $95$ acertos)
*(Equivalente à entrada das tabuadas do $11$ e $12$ no jogo original)*
* **Potenciação:**
  * Quadrados perfeitos de $11^2$ até $15^2$ (podendo incluir $20^2$).
  * Cubos perfeitos médios: $6^3, 7^3, 8^3, 9^3$.
  * Potências de base $2$ avançadas ($2^7, 2^8, 2^9, 2^{10}$).
* **Radiciação:**
  * Raízes quadradas de $\sqrt{121}$ até $\sqrt{225}$ (e $\sqrt{400}$).
  * Raízes cúbicas de $\sqrt[3]{216}$ até $\sqrt[3]{729}$.
  * Raízes quartas e quintas adicionais: $\sqrt[4]{81}, \sqrt[4]{256}, \sqrt[5]{243}$.

*(Regras adicionais de sorteio:)*
* Evitar que a mesma pergunta apareça duas vezes consecutivas.
* **Níveis cumulativos:** nos níveis mais elevados também podem aparecer questões dos níveis anteriores. Para manter a progressão, a questão é sorteada do **nível atual com $70\%$ de chance** e dos **níveis anteriores com $30\%$** (no Nível 1 sempre do próprio nível).

---

## 3. Requisitos Funcionais (RF)

* **RF01 - Autenticação e Conta de Usuário:**
  * O sistema deve permitir que o usuário crie uma conta (Nome/Nickname, E-mail e Senha) e faça login.
  * Usuários não logados (convidados) podem jogar normalmente, tendo seu recorde pessoal salvo localmente no navegador (`localStorage`), mas apenas usuários autenticados (ou que informem um nome válido) terão históricos persistidos no banco de dados.
* **RF02 - Seleção de Modalidade:**
  * Na tela inicial, o jogador deve poder alternar entre "Potenciação" e "Radiciação".
* **RF03 - Painel de Resumo de Recordes (Tela Inicial):**
  * Exibir na tela inicial, de acordo com a modalidade selecionada:
    * `O seu resultado mais alto:` (Maior pontuação do usuário logado ou salvo no navegador).
    * `Resultado mais alto de hoje:` (Maior pontuação global registrada no dia atual).
    * `Resultado mais alto deste ano:` (Maior pontuação global registrada no ano corrente).
* **RF04 - Execução da Partida:**
  * Gerenciar o estado do jogo (`IDLE`, `COUNTDOWN`, `PLAYING`, `FINISHED`), cronômetro de $100$ segundos, validação de respostas em tempo real (com até $2$ tentativas por questão), contagem de respostas erradas e atribuição de estrelas.
* **RF05 - Tabela de Classificação (Highscores) e Histórico:**
  * Ao clicar no botão "Highscores", exibir um modal ou tela sobreposta listando o **Top 10** de resultados.
  * Permitir filtrar a tabela por 4 abas:
    1. **Os seus resultados:** Histórico das 10 melhores partidas do próprio usuário logado.
    2. **Dia:** Top 10 global das partidas realizadas hoje (a partir das $00\text{h}00$).
    3. **Semana:** Top 10 global dos últimos $7$ dias (ou semana corrente).
    4. **Ano:** Top 10 global do ano atual.

---

## 4. Requisitos Não Funcionais (RNF)

* **RNF01 - Latência Zero na Troca de Questões:** A geração de perguntas e validação de respostas durante os $100$ segundos deve ocorrer no *client-side* (React) para garantir que não haja atraso de rede (*lag*) entre o usuário apertar `Enter` e a próxima questão aparecer. Ao final dos $100$ segundos, o resultado consolidado é enviado ao backend Spring Boot.
* **RNF02 - Segurança Anti-Fraude Básica:** A requisição de salvamento de pontuação ao final da partida deve conter metadados básicos (como o tempo gasto e quantidade de questões por nível) ou validação de limite humano plausível no backend (ex: rejeitar pontuações impossíveis como $> 300$ acertos ou $> 300$ respostas erradas em $100$ segundos).
* **RNF03 - Responsividade e Acessibilidade:** O layout deve priorizar o uso do teclado físico em desktops e exibir o teclado numérico nativo (`inputmode="numeric"`) em dispositivos móveis.
* **RNF04 - Renderização Matemática Clara:** No React, as potências devem usar a tag `<sup>` (ex: `2<sup>3</sup>`) e as raízes devem ter representação visual clara de índice e radicando para leitura imediata.

---

## 5. Telas e Interface do Usuário (Baseado nas Referências)

1. **Tela Inicial do Jogo:**
   * Título "100 segundos" e chamada "Quantas perguntas consegue responder dentro de 100 segundos? Faça o teste!".
   * Seletor de modo: `[ Potenciação ]` | `[ Radiciação ]`.
   * Resumo de recordes alinhado à direita (Seu mais alto, Hoje, Ano).
   * Botão central grande "Início" (verde/destaque) e botão secundário "Highscores" no canto inferior direito.
2. **Tela de Contagem Regressiva:**
   * Quadro laranja limpo exibindo apenas o número da contagem ($3 \rightarrow 2 \rightarrow 1$) ao centro.
3. **Tela de Gameplay:**
   * Topo esquerdo: Barra de progresso verde + indicador `Tempo: 93`.
   * Topo direito: `Resultado: 0` e `Resultado mais alto: 118`.
   * Centro: A expressão matemática grande (ex: $2^4 =$ ou $\sqrt{81} =$) acima de um `input` branco quadrado grande com cursor centralizado.
   * Abaixo/Direita do input: Botão "Respondida".
   * Rodapé do quadro: Faixa escura contendo $10$ ícones de estrelas.
4. **Tela de Highscores (Ranking):**
   * Topo esquerdo: Links de filtro (`Os seus resultados:` | `Dia` | `Semana` | `Ano`).
   * Topo direito: Botão fechar (`X`).
   * Centro: Quadro arredondado com título dinâmico (ex: "Resultado mais alto de hoje") e tabela de $1.$ a $10.$ com colunas `Nome` e `Resultado`.
   * Rodapé: Botão "Voltar".
5. **Tela de Resultado (fim da partida):**
   * Exibe `Resultado` (acertos), estrelas conquistadas e `Respostas erradas`.
   * Botões "Jogar novamente" e "Highscores".

---

## 6. Modelagem de Dados Sugerida (PostgreSQL)

### Tabela: `users`
| Coluna | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` ou `BIGSERIAL` | `PRIMARY KEY` | Identificador único do usuário |
| `username` | `VARCHAR(50)` | `NOT NULL, UNIQUE` | Nome exibido no ranking |
| `email` | `VARCHAR(100)` | `NOT NULL, UNIQUE` | E-mail para login |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | Senha criptografada (BCrypt) |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Data de criação da conta |

### Tabela: `game_scores`
| Coluna | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | `PRIMARY KEY` | Identificador da partida |
| `user_id` | `UUID` / `BIGINT` | `FOREIGN KEY (users.id)` | Usuário que jogou (pode ser `NULL` se permitir anônimo no ranking global) |
| `player_name` | `VARCHAR(50)` | `NOT NULL` | Nome gravado no momento do recorde |
| `game_mode` | `VARCHAR(20)` | `NOT NULL` | `'EXPONENTIATION'` ou `'ROOT_EXTRACTION'` |
| `score` | `INTEGER` | `NOT NULL` | Quantidade de respostas corretas |
| `stars_earned` | `INTEGER` | `NOT NULL` | Estrelas ganhas ($\min(10, \lfloor \text{score} / 10 \rfloor)$) |
| `wrong_answers` | `INTEGER` | `NOT NULL DEFAULT 0` | Quantidade de respostas erradas submetidas na partida |
| `played_at` | `TIMESTAMP` | `DEFAULT NOW()` | Data e hora da partida (indexada para filtros de Dia/Semana/Ano) |

*(Sugestão de Índice no PostgreSQL: `CREATE INDEX idx_scores_mode_date ON game_scores (game_mode, played_at DESC, score DESC);` para deixar as buscas de ranking extremamente rápidas).*

---

## 7. Endpoints da API (Spring Boot)

### Autenticação (`/api/auth`)
* `POST /api/auth/register` - Cria um novo usuário.
* `POST /api/auth/login` - Autentica o usuário e retorna o token JWT.

### Pontuações e Rankings (`/api/scores`)
* `POST /api/scores` - Salva o resultado de uma partida finalizada.
  * *Payload:* `{ "gameMode": "EXPONENTIATION", "score": 105, "wrongAnswers": 7, "playerName": "opcional, apenas para convidados" }`
* `GET /api/scores/summary?mode={EXPONENTIATION|ROOT_EXTRACTION}` - Retorna os 3 números da tela inicial (`personalBest`, `todayBest`, `yearBest`).
* `GET /api/scores/leaderboard?mode={EXPONENTIATION|ROOT_EXTRACTION}&period={DAY|WEEK|YEAR|USER}` - Retorna a lista com o Top 10 para a aba selecionada na tela de Highscores.
---

## 8. Arquitetura (Clean Architecture)

A aplicação seguirá a **Clean Architecture**, respeitando a **regra de dependência**: as camadas internas (domínio) não conhecem as camadas externas (frameworks, banco, HTTP, UI).

### 8.1. Backend (Spring Boot)
Estrutura de pacotes sugerida (`api/src/main/java/com/hundredseconds/api/`):

```
domain/            # Entities, value objects, enums e regras de negócio puras (sem Spring/JPA)
  model/           # ex: User, GameScore, GameMode, LeaderboardPeriod
  repository/      # Interfaces (ports) ex: GameScoreRepository, UserRepository
  exception/       # ex: ImplausibleScoreException
application/       # Casos de uso (orquestram o domínio)
  usecase/         # ex: SaveScoreUseCase, GetScoreSummaryUseCase, GetLeaderboardUseCase, RegisterUserUseCase, LoginUseCase
  dto/             # Objetos de entrada/saída dos casos de uso
infrastructure/    # Implementações concretas (adapters)
  persistence/     # JPA entities, Spring Data repositories e adapters que implementam os ports do domínio
  security/        # JWT, Spring Security config, PasswordEncoder
  config/          # Beans e configurações do Spring
presentation/      # Camada de entrada (web)
  controller/      # ex: AuthController, ScoreController
  request/         # ex: SaveScoreRequest
  response/        # ex: ScoreSummaryResponse, LeaderboardEntryResponse
```

* Entidades de domínio **não** devem conter anotações JPA; o mapeamento é feito na camada `infrastructure/persistence`.
* Regras como o cálculo de estrelas e a validação anti-fraude (RNF02) pertencem ao **domínio**.

### 8.2. Frontend (React + Vite)
Estrutura de pastas sugerida (`web_app/src/`):

```
domain/            # Tipos e regras puras do jogo (sem React)
  entities/        # ex: Question, GameSession, GameMode
  services/        # ex: QuestionGenerator, DifficultyLevelResolver, StarCalculator
application/       # Casos de uso / hooks de orquestração (ex: useGameSession, useLeaderboard)
infrastructure/    # Acesso externo
  http/            # ex: ScoreApiClient, AuthApiClient
  storage/         # ex: LocalStorageScoreRepository (recorde de convidados)
presentation/      # Componentes e páginas React
  pages/           # ex: HomePage, GamePage, HighscoresPage
  components/      # ex: ProgressBar, StarBar, MathExpression, CountdownOverlay
```

* A lógica de geração de questões e progressão de dificuldade (seção 2.4) fica em `domain/` e deve ser testável sem React.

---

## 9. Containerização (Docker)

Todos os serviços são executados via **Docker Compose** (`docker compose up --build`):

| Serviço | Imagem / Build | Porta no host | Descrição |
| :--- | :--- | :--- | :--- |
| `db` | `postgres:16-alpine` | `5433` (`POSTGRES_HOST_PORT`) | Banco de dados PostgreSQL com volume persistente `db_data` |
| `api` | `api/Dockerfile` (multi-stage: Maven → `eclipse-temurin:25-jre-alpine`, usuário não-root) | não exposta | Backend Spring Boot; health check em `/actuator/health/readiness` |
| `web_app` | `web_app/Dockerfile` (multi-stage: Node build → `nginx:1.29-alpine`) | `8088` (`WEB_HOST_PORT`) | Frontend servido pelo Nginx, que encaminha `/api` para o serviço `api` (mesma origem, sem CORS) |

* Arquivo `docker-compose.yml` na raiz do projeto.
* Credenciais e configurações (`POSTGRES_*`, `JWT_SECRET`, `APP_TIME_ZONE`, portas) via `.env` (não versionado), com `.env.example` versionado. O compose recusa subir sem `JWT_SECRET`.
* Ordem de inicialização com health checks: `db` → `api` → `web_app`.
* Os testes não rodam dentro do build das imagens (os testes de integração usam Testcontainers e precisam do Docker do host).

--- | :--- | :--- | :--- |
| `db` | `postgres:16` | `5432` | Banco de dados PostgreSQL com volume persistente |
| `api` | Build de `api/Dockerfile` (multi-stage: Maven + JRE) | `8080` | Backend Spring Boot |
| `web_app` | Build de `web_app/Dockerfile` (multi-stage: Node build + Nginx) | `80` / `5173` | Frontend React servido pelo Nginx |

* Arquivo `docker-compose.yml` na raiz do projeto.
* Credenciais e configurações (ex: `POSTGRES_PASSWORD`, `JWT_SECRET`, `DATABASE_URL`) via variáveis de ambiente em arquivo `.env` (não versionado), com um `.env.example` versionado.
* O serviço `api` deve depender do `db` (`depends_on` com `healthcheck`).
* Um único comando deve subir o ambiente completo: `docker compose up --build`.

---

## 10. Estratégia de Testes

### 10.1. Backend
* **JUnit 5** para testes unitários, com **Mockito** para isolar dependências (ports/repositórios).
* Prioridade de cobertura: camada `domain` (cálculo de estrelas, validação anti-fraude, períodos de ranking) e `application` (casos de uso).
* Testes de integração (controllers + banco) com `@SpringBootTest` / `@WebMvcTest` e Testcontainers (PostgreSQL), quando necessário.

### 10.2. Frontend
* **Vitest** + **React Testing Library** para testes unitários e de componentes (API compatível com Jest e integrada nativamente ao Vite).
  * Prioridade: `domain/` (gerador de questões, progressão de dificuldade, regra de não repetir questão consecutiva, cálculo de estrelas).
* **Playwright** para testes end-to-end (fluxo completo: início → contagem → partida → resultado → highscores).

---

## 11. Plano de Implementação (por partes)

| Parte | Escopo | Entregáveis |
| :--- | :--- | :--- |
| **1** | Infraestrutura base | `docker-compose.yml` (PostgreSQL), `.env.example`, dependências do backend (Web, JPA, Security, Validation, Flyway), migration inicial das tabelas |
| **2** | Backend – domínio e casos de uso | Entidades, enums, ports, regras (estrelas, anti-fraude) e casos de uso com testes JUnit |
| **3** | Backend – infraestrutura e API | Persistência JPA, autenticação JWT, controllers dos endpoints da seção 7, tratamento de erros |
| **4** | Frontend – domínio do jogo | Gerador de questões e níveis de dificuldade com testes Vitest |
| **5** | Frontend – telas | Mantine, telas da seção 5 (inicial, contagem, partida, highscores), som dos últimos 10 s |
| **6** | Integração | Clientes HTTP, login/cadastro, `localStorage` para convidados, salvamento de pontuação |
| **7** | Containerização final e E2E | Dockerfiles de `api` e `web_app`, compose completo, testes Playwright |

Cada parte termina com testes passando e um commit. **Status:** todas as 7 partes foram concluídas.

---

## 12. Contrato da API (detalhes de implementação)

* **Autenticação:** `Authorization: Bearer <token>` (JWT HS256, validade padrão de 24h, `sub` = id do usuário). Os endpoints de pontuação são públicos; quando um token válido é enviado, o jogador é identificado. Um token inválido ou expirado resulta em `401`.
* **Respostas de `POST /api/auth/login`:** `{ "accessToken", "tokenType": "Bearer", "userId", "username" }`.
* **Erros:** formato *Problem Details* (RFC 9457) com a propriedade extra `code`, que o frontend traduz para mensagens em português. Erros de validação trazem também `errors` (campo → mensagem).

| HTTP | `code` | Quando |
| :--- | :--- | :--- |
| `400` | `VALIDATION_ERROR` | Corpo inválido, campo obrigatório ausente, modo/período desconhecido |
| `400` | `INVALID_PLAYER_NAME` / `INVALID_EMAIL` / `INVALID_PASSWORD` | Regras de domínio violadas (ex: convidado sem nome) |
| `401` | `INVALID_CREDENTIALS` | E-mail ou senha incorretos |
| `401` | `AUTHENTICATION_REQUIRED` | Aba "Os seus resultados" (`period=USER`) sem login |
| `404` | `USER_NOT_FOUND` | Token de um usuário que não existe mais |
| `409` | `EMAIL_ALREADY_IN_USE` / `USERNAME_ALREADY_IN_USE` / `CONFLICT` | Cadastro duplicado |
| `422` | `IMPLAUSIBLE_SCORE` | Pontuação fora do limite humano (anti-fraude) |

---

## 13. Integração Frontend ↔ Backend (detalhes de implementação)

* **Desenvolvimento local:** o Vite encaminha `/api` para o backend (proxy), usando a porta `SERVER_PORT` do `.env` da raiz. Em produção a URL pode ser definida com `VITE_API_BASE_URL` (vazio = mesma origem).
* **Sessão:** após o login o token JWT fica no `localStorage` e é descartado automaticamente quando expira ou quando a API responde `401`. O cadastro já faz o login em seguida.
* **Jogador logado:** resultados, recorde pessoal e "Os seus resultados" vêm da API. Se a API falhar ao salvar, o resultado é guardado no navegador e o jogador é avisado.
* **Convidado:** o resultado é sempre salvo no navegador (recorde pessoal e "Os seus resultados"). Na tela de resultado ele pode **informar um nome** para publicar a partida no ranking global (o último nome digitado é lembrado). Os números globais (Hoje/Ano e abas Dia/Semana/Ano) vêm da API.
* **Sem conexão:** a tela inicial mostra os números conhecidos pelo navegador e o jogo continua funcionando.
* **Mensagens de erro:** o campo `code` das respostas de erro é traduzido para português no frontend.
