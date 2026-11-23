# Microblog SSR: Design

Data: 2026-11-23 · Status: aguardando revisão

## 1. Objetivo

Projeto de estudo de **renderização no servidor (SSR)** com um meta-framework, construído com boas práticas de engenharia: testes, CI, Docker, ADRs e PRs pequenos. O produto é um **microblog** (mini rede social) entregue em fases. O produto importa menos que o aprendizado de SSR.

### Conceitos de SSR a exercitar

| Conceito                                    | Onde aparece                                                    |
| ------------------------------------------- | --------------------------------------------------------------- |
| SSG (pré-renderização)                      | Landing e "sobre"                                               |
| SSR por requisição                          | Feed, perfil e post                                             |
| Data fetching no servidor + `TransferState` | Todas as páginas dinâmicas                                      |
| SEO                                         | Title, meta, canonical, Open Graph, `sitemap.xml`, `robots.txt` |
| Hidratação incremental (`@defer`)           | Curtidas e comentários                                          |
| Cache HTTP                                  | `Cache-Control` por rota                                        |
| Erros com status correto                    | 404 e 500 reais                                                 |
| SSR com estado de usuário (fase 2)          | Sessão em cookie, `Vary`, `no-store`                            |

## 2. Decisões

- **Framework:** Angular 22 (latest do CLI em 2026-11-23: 22.3.0) com `@angular/ssr`, TypeScript estrito, standalone components e signals.
- **Runtime:** Node 24 LTS (o CLI exige `^22.22.3 || ^24.15.0 || >=26`), gerenciado com `fnm` (`.node-version`).
- **Gerenciador de pacotes:** pnpm, fixado em `packageManager` e ativado via `corepack`. Dependências com build nativo (`better-sqlite3`) entram em `onlyBuiltDependencies`.
- **Servidor:** Express, o caminho oficial do `@angular/ssr`. API e SSR no mesmo processo (monólito).
- **Banco:** SQLite com `better-sqlite3` e Drizzle ORM (migrations versionadas).
- **Validação:** Zod (entrada da API e variáveis de ambiente). **Log:** `pino`.
- **Testes:** Vitest (unidade e integração) e Playwright (E2E). A escolha do Vitest como runner padrão do Angular 22 deve ser **confirmada no setup**.
- **Qualidade:** ESLint (`angular-eslint`), Prettier, Conventional Commits.
- **Entrega:** Dockerfile multi-stage e GitHub Actions.
- **Fora do escopo (YAGNI):** tempo real, upload de imagens, notificações, i18n, deploy em nuvem.

## 3. Estrutura e fronteiras

```
ssr/
├─ src/
│  ├─ app/               # Angular (UI)
│  │  ├─ core/           # sessão, interceptors, SeoService
│  │  ├─ features/       # feed, post, profile (cada um com suas rotas)
│  │  └─ app.routes.ts, app.routes.server.ts
│  ├─ server/            # só roda no Node
│  │  ├─ api/            # rotas HTTP + validação (Zod)
│  │  ├─ services/       # regras de negócio
│  │  ├─ db/             # schema Drizzle, migrations, repositórios
│  │  └─ app.ts          # monta o Express (sem listen, para testar)
│  ├─ shared/            # DTOs/tipos usados pelos dois lados
│  └─ server.ts          # entrypoint: Express + Angular SSR
├─ e2e/                  # Playwright
├─ docs/adr, docs/superpowers
├─ Dockerfile, .github/workflows/ci.yml
```

Regras:

- `app/` nunca importa de `server/`, e `server/` nunca importa de `app/`. O que for comum vive em `shared/`.
- Dentro de `server/`, cada camada só conhece a de baixo: `api` → `services` → `db`.
- `app.ts` exporta o Express sem chamar `listen`, para a API ser testável sem o Angular.

## 4. Fluxo de uma requisição

1. Arquivos estáticos do build.
2. `/api/*`, `/sitemap.xml` e `/robots.txt` são tratados pelo Express.
3. Qualquer outra URL vai ao Angular SSR, que devolve HTML.
4. No navegador, o Angular hidrata o HTML e reaproveita os dados via `TransferState`, sem repetir as chamadas.

Os componentes buscam dados com `HttpClient` em `/api`, com o mesmo código no servidor e no navegador. No servidor a chamada passa por loopback para o próprio Express. Injetar os serviços direto no processo é uma otimização possível, a registrar em ADR se for adotada. Na fase 2, o servidor deve repassar o cookie de sessão nessas chamadas.

## 5. Renderização por rota (fase 1)

| Rota          | Modo      | Cache-Control                                | Observação                                              |
| ------------- | --------- | -------------------------------------------- | ------------------------------------------------------- |
| `/`, `/sobre` | Prerender | `public`, longo                              | Gerada no build                                         |
| `/feed`       | SSR       | `public, max-age=30, stale-while-revalidate` | Paginação por `?page=`                                  |
| `/u/:handle`  | SSR       | `public, max-age=60`                         | Meta tags de perfil                                     |
| `/p/:id`      | SSR       | `public, max-age=60`                         | Open Graph com o texto do post; 404 real se não existir |
| `**`          | SSR       | `no-store`                                   | Página 404 com status 404                               |

Na fase 2, rotas dependentes de sessão usam `private, no-store` com `Vary: Cookie`.

- **SEO:** um `SeoService` define title, descrição, canonical e Open Graph por rota. `sitemap.xml` e `robots.txt` são gerados no servidor a partir do banco.
- **Hidratação incremental:** curtidas e comentários em blocos `@defer` com `hydrate on viewport`.
- **Erros:** 404 e 500 com o status HTTP correto. O servidor loga o erro e não expõe detalhes ao cliente.
- **Código só de navegador:** `window`/`localStorage` protegidos por `afterNextRender` ou `isPlatformBrowser`.

## 6. Dados e API (fase 1)

Fase 1 é **somente leitura** e usa um script de seed.

- `users`: `id`, `handle` (único), `display_name`, `bio`, `created_at`.
- `posts`: `id`, `user_id`, `body` (até 280 caracteres), `created_at`, com índice em `created_at`.

Endpoints:

- `GET /api/posts?page=&limit=`
- `GET /api/posts/:id`
- `GET /api/users/:handle`
- `GET /api/users/:handle/posts`
- `GET /api/health`

Erros seguem o formato único `{ "error": { "code", "message" } }`. A configuração vem de variáveis de ambiente validadas na inicialização.

## 7. Testes

- **Vitest, unidade:** serviços, `SeoService` e componentes.
- **Vitest, integração:** API com SQLite em memória (via `supertest`), cobrindo repositórios e rotas.
- **Playwright, E2E:**
  - o HTML bruto da resposta já contém o texto do post, sem executar JS;
  - a hidratação funciona;
  - post inexistente devolve status 404;
  - meta tags e `sitemap.xml` estão corretos.
- TDD nas camadas de serviço e API. Sem meta numérica de cobertura.

## 8. Qualidade e entrega

- TypeScript estrito, ESLint, Prettier, Conventional Commits.
- `main` protegida, trabalho em PRs pequenos por fatia, mesmo sendo projeto solo.
- ADRs curtos em `docs/adr` para decisões relevantes: Express, SQLite, pnpm, loopback vs. injeção direta.
- Dockerfile multi-stage, usuário não-root e `HEALTHCHECK` em `/api/health`. O banco fica em volume.
- GitHub Actions: lint, typecheck, testes, build, E2E e build da imagem Docker.

## 9. Fases

1. **Fase 1 (público, somente leitura):** feed, perfil, post, SEO, cache, hidratação incremental, testes, Docker e CI.
2. **Fase 2:** login por sessão em cookie `httpOnly`, criar post e curtir. SSR com estado de usuário e cache seguro.
3. **Fase 3 (opcional):** seguir e feed personalizado.

Cada fase é entregável isoladamente e tem seu próprio plano de implementação.

## 10. Riscos e pontos a confirmar no setup

- Confirmar que o Vitest é o runner padrão do Angular 22 e como ele integra com o CLI.
- Confirmar a API atual de `serverRoutes` e de hidratação incremental no Angular 22.
- Garantir que `better-sqlite3` compila com Node 24 e pnpm (`onlyBuiltDependencies`) e na imagem Docker.
- Evitar que o cache sirva conteúdo de um usuário a outro (fase 2).
