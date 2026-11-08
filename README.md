# 100 Segundos – Potenciação e Radiciação

Jogo web de perguntas rápidas: quantas potências ou raízes você consegue resolver em 100 segundos?

- **Frontend:** React + TypeScript (Vite) e Mantine — `web_app/`
- **Backend:** Java 25 + Spring Boot 4 (Clean Architecture, JWT) — `api/`
- **Banco:** PostgreSQL 16 (migrations com Flyway)
- **Especificação completa:** [`requirements_specification_100_seconds_game.md`](requirements_specification_100_seconds_game.md)

## Rodando com Docker (tudo junto)

```bash
cp .env.example .env          # ajuste as senhas e gere um JWT_SECRET (openssl rand -base64 48)
docker compose up --build -d
```

Acesse **http://localhost:8088** (porta configurável em `WEB_HOST_PORT`).

| Serviço | Descrição | Porta no host |
| :--- | :--- | :--- |
| `web_app` | Nginx servindo o React e encaminhando `/api` para a API | `8088` |
| `api` | Spring Boot (não exposto; acessado via Nginx) | – |
| `db` | PostgreSQL | `5433` |

Para parar: `docker compose down` (os dados ficam no volume `db_data`; use `down -v` para apagá-los).

## Desenvolvimento local

```bash
docker compose up -d db                 # só o banco
cd api && ./mvnw spring-boot:run        # API na porta SERVER_PORT do .env
cd web_app && npm install && npm run dev  # http://localhost:5173 (proxy de /api para a API)
```

## Testes

| Comando | O que testa |
| :--- | :--- |
| `cd api && ./mvnw test` | JUnit 5 + Mockito (domínio e casos de uso) e integração com PostgreSQL via Testcontainers (requer Docker) |
| `cd web_app && npm test` | Vitest + Testing Library (domínio do jogo, componentes e integração com a API simulada) |
| `cd web_app && npm run test:e2e` | Playwright de ponta a ponta (desktop e celular) contra a stack do Docker em `http://localhost:8088` |

Na primeira vez, instale o navegador do Playwright com `npx playwright install chromium`.
Para rodar o E2E contra o servidor de desenvolvimento: `E2E_BASE_URL=http://localhost:5173 npm run test:e2e`.

## Convenções

Código, nomes de arquivos e comentários em inglês; apenas a documentação (`.md`) e os textos da interface em português.
