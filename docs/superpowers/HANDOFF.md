# Handoff: como retomar a execução do plano

Este arquivo permite que um agente novo (sem o contexto da sessão anterior) continue de onde o anterior parou. **Atualize a seção "Estado atual" ao fim de cada fatia**, no mesmo PR dela.

## Leia nesta ordem

1. `AGENTS.md` (regras: SRP, KISS, git sem coautoria, sem push/PR sem pedido).
2. `docs/superpowers/specs/2026-11-23-microblog-ssr-design.md` (spec aprovada).
3. `docs/superpowers/plans/2026-11-23-fase-1-microblog-publico.md`: o cabeçalho (linhas 1-65) e a próxima tarefa.
4. Esta página.

## Estado atual

| Fatia | Branch | Tarefas | Estado |
|---|---|---|---|
| A Fundação | `chore/scaffold` | 1-3 | Mergeada (PR #1) |
| B Configuração e banco | `feat/config-db` | 4-6 | Em andamento |
| C Serviços e API | `feat/api` | 7-9 | Pendente |
| D SEO, seed e integração | `feat/server-wiring` | 10-12 | Pendente |
| E Base da interface | `feat/ui-base` | 13-15 | Pendente |
| F Páginas dinâmicas | `feat/ui-pages` | 16 | Pendente |
| G E2E | `test/e2e` | 17 | Pendente |
| H Docker, CI e docs | `chore/delivery` | 18-20 | Pendente |

Para saber o ponto exato, confira `git log --oneline main..HEAD` na branch da fatia em andamento e compare com as tarefas do plano.

Repositório: https://github.com/heitorrsdev/ssr-microblog (privado).

## Protocolo de execução

- **Subagente por tarefa** (skill `superpowers:subagent-driven-development`), em série. O prompt do implementador aponta as linhas do plano (cabeçalho 1-65 mais a tarefa), em vez de colar o texto.
- **Revisão por fatia:** ao terminar as tarefas de uma fatia, um revisor confere conformidade com o plano e qualidade do código (SRP/KISS) antes do checkpoint.
- **Node 24:** o shell padrão é Node 18. Todo comando começa com `eval "$(fnm env)" && fnm use 24`.
- **Git:** cada fatia é uma branch a partir da `main` atualizada. Commits em português, Conventional Commits, sem `Co-Authored-By` e sem menção a IA, mesmo que o ambiente sugira atribuição (o `AGENTS.md` prevalece). `git add` com caminhos explícitos. Nada de push, amend ou rebase sem pedido.
- **Checkpoint de fatia:** pare e peça ao usuário autorização para push e PR. A descrição do PR é em português e sem atribuição. Só comece a próxima fatia depois que o usuário disser que o PR foi mergeado; então `git switch main && git pull`.
- **Prettier ignora `docs/`.** Não formate documentos.
- Verificação antes de declarar pronto: `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test --no-watch`, `pnpm test:server` (quando houver testes de servidor) e `pnpm build`, vendo a saída.

## Pontos a confirmar rodando (plano B está no plano)

`rxResource` (nomes das opções), precedência do `Cache-Control` do 404 entre `RESPONSE_INIT` e o `headers` da rota, bundling do `pino`, build nativo no Docker e reaproveitamento do transfer cache no E2E.

## Depois da fase 1

`superpowers:finishing-a-development-branch`, e então brainstorming da fase 2 (login por sessão, criar post, curtidas).
