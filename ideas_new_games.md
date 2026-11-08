# Ideias: Novos Jogos (Geografia do Brasil)

> Rascunho de ideias, ainda não é especificação. Data: 2026-11-07.
>
> **Bandeiras, Siglas e Capitais dos estados: implementados** (2026-11-08). As regras estão na seção 2.1 de `requirements_specification_100_seconds_game.md`: 100 s, pontuação por acertos e uma única tentativa.

## Jogos

| Jogo | O que aparece na tela | O que a pessoa digita |
|---|---|---|
| Bandeiras dos estados | Imagem da bandeira | Nome do estado |
| Estados brasileiros | Sigla ou capital (a definir) | Nome do estado |
| Siglas dos estados | Nome do estado | Sigla (ex.: `SP`) |
| Capitais dos estados | Nome do estado | Nome da capital |
| Gentílicos das capitais | Nome da capital | Gentílico (ex.: Salvador → soteropolitano) |

Base: 26 estados + Distrito Federal = **27 itens** por jogo.

## Mecânica (parecida com o 100 Segundos)

- Os itens aparecem em **ordem aleatória**.
- A pessoa digita a resposta e aperta **Enter** para enviar.
- Se errar, **aparece a resposta certa** e o tempo **continua correndo**.
- Se a pessoa estiver **logada**, o tempo dela fica registrado (histórico e ranking, como já existe hoje).

## Em aberto

- **Tempo / formato da partida.** Opções:
  - **Cronômetro progressivo:** responder os 27 itens o mais rápido possível. A pontuação é o tempo final, talvez com penalidade por erro (ex.: +5 s). Combina bem com uma lista que tem fim.
  - **Contagem regressiva:** tempo fixo (ex.: 60 s ou 100 s), e a pontuação é o número de acertos. Se a pessoa acabar os 27 antes do tempo, a partida termina ou os itens se repetem?
- **Comparação da resposta:** ignorar maiúsculas/minúsculas, acentos e espaços extras ("sao paulo" = "São Paulo").
- **Variantes aceitas:** gentílicos com mais de uma forma (ex.: Rio de Janeiro → carioca), "DF" e "Distrito Federal".
- **Gentílicos do DF/Brasília:** brasiliense.
- **Imagens das bandeiras:** origem e licença (ex.: SVGs em domínio público na Wikimedia), servidas pelo front.
- **Ranking:** separado por jogo, como hoje é separado por modalidade (`mode`).
- **Arquitetura:** generalizar o motor de jogo atual (pergunta → resposta → validação) para receber "baralhos" de perguntas, em vez de criar cada jogo do zero.
