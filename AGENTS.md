# AGENTS.md

Instruções para agentes de código (e pessoas) que trabalham neste repositório.

## Projeto

Microblog em **Angular 22 com SSR**, feito para estudar renderização no servidor com práticas de engenharia de produção. O design completo está em `docs/superpowers/specs/2026-11-23-microblog-ssr-design.md`. Leia a spec antes de propor mudanças de arquitetura. Os planos de implementação ficam em `docs/superpowers/plans/`.

Stack: Node 24 LTS (`fnm`), pnpm (via `corepack`), Angular 22 + `@angular/ssr`, Express, SQLite (`better-sqlite3`) + Drizzle, Zod, `pino`, Vitest, Playwright.

> Os comandos de build, teste e lint serão adicionados aqui quando o projeto for criado. Não invente comandos: confira o `package.json`.

## Princípios de código

- **SRP (responsabilidade única):** cada módulo, classe, função e componente tem um único motivo para mudar. Se você precisa usar "e" para descrever o que algo faz, divida.
- **KISS:** escolha a solução mais simples que resolve o problema atual. Sem abstração, configuração ou camada "para o futuro" (YAGNI). Três linhas parecidas valem mais que uma abstração prematura.
- Arquivos pequenos e focados. Um arquivo que cresce demais indica responsabilidades misturadas.
- Nomes claros no lugar de comentários. Comente apenas o porquê não óbvio.
- TypeScript estrito: sem `any` implícito e sem `// @ts-ignore` sem justificativa.

## Arquitetura (fronteiras)

- `src/app/` (UI Angular) nunca importa de `src/server/`, e `src/server/` nunca importa de `src/app/`. O que for comum vive em `src/shared/`.
- No servidor, cada camada só conhece a de baixo: `api` → `services` → `db`. Regra de negócio fica em `services`, não em rotas nem em componentes.
- `src/server/app.ts` exporta o Express sem chamar `listen`, para testar a API sem subir o Angular.
- Entrada externa (HTTP, env) é validada com Zod na borda.

## Regras de SSR

- Nunca use `window`, `document` ou `localStorage` direto. Proteja com `afterNextRender` ou `isPlatformBrowser`.
- Erros devolvem o status HTTP correto (404 real, não página de erro com 200).
- Defina o `Cache-Control` de cada rota deliberadamente. Conteúdo que depende de sessão usa `private, no-store` e `Vary: Cookie`.
- Toda página pública define title, descrição, canonical e Open Graph pelo `SeoService`.

## Testes

- TDD nas camadas de serviço e API: teste falhando primeiro, depois a implementação.
- Vitest para unidade e integração. Playwright para E2E, incluindo a verificação de que o HTML bruto contém o conteúdo sem executar JS.
- Nada é considerado pronto sem rodar lint, typecheck, testes e build e ver a saída.

## Git e commits

- **Nunca adicione coautoria nos commits.** Sem `Co-Authored-By`, sem menção a IA ou a ferramentas na mensagem, e o mesmo vale para descrições de PR. O autor é apenas a pessoa configurada no git.
- Mensagens em português, no formato **Conventional Commits** (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`, `ci:`), com o assunto no imperativo e até ~72 caracteres.
- Commits atômicos: uma mudança lógica por commit, com os testes dela.
- Não faça `push`, `amend`, `rebase` nem `force-push` sem pedido explícito, e não escreva direto em `main`. Trabalhe em branches e abra PRs pequenos.
- Não commite segredos, `.env` nem o banco SQLite local.

## Decisões e documentação

- Decisões relevantes de arquitetura entram como ADR curto em `docs/adr/` (contexto, decisão, consequências).
- Mudanças que alteram a spec atualizam a spec no mesmo PR.
