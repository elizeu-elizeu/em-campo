<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# relatorios-app — "EmCampo"

App **EmCampo** (nome do produto na UI) — relatórios de campo para prestadoras de serviço: o gestor cria modelos de relatório (formulários dinâmicos), o técnico preenche **offline** no celular (fotos, assinatura) e sincroniza quando a conexão volta. Plano completo em `C:\Users\andra\.claude\plans\quero-fazer-um-aplicativo-parsed-rivest.md`.

## Stack

Next.js 16 (App Router, `src/`), TypeScript, Tailwind, Prisma 6 + SQLite, iron-session + bcryptjs, @serwist/next (PWA), idb (IndexedDB).

## Arquitetura — regras invioláveis

- **Rascunho vive só no aparelho** (IndexedDB). O servidor só recebe relatório completo via `POST /api/sync`, idempotente por `uuid` gerado no cliente.
- **Respostas são snapshot JSON** autocontido (`[{campoId, rotulo, tipo, valor}]`) — relatório antigo nunca quebra quando o modelo muda.
- Correção de relatório DEVOLVIDO acontece **online** (limitação aceita).
- `/campo` = técnico, mobile-first, funciona offline. `/painel` = gestor, desktop, online.

## Convenções

- UI e domínio em português (Relatorio, Modelo, Campo); código/infra em inglês idiomático.
- Mutações do gestor: server actions em `src/lib/actions.ts`. APIs do cliente offline: route handlers (`/api/bootstrap`, `/api/sync`, `/api/fotos`).
- **Toda** action e rota mutante começa com `requireUser(...)` de `src/lib/session.ts` + validação de entrada.
- Dependência nova só quando nativo/stdlib não resolve (assinatura = canvas puro, PDF = vista de impressão + `window.print()`).
- Usuários seed: `gestor@empresa.com` / `tecnico@empresa.com`, senha `123456`.

## Comandos

- `npm run dev` — dev server
- `npx tsc --noEmit` — typecheck
- `npx prisma migrate dev` / `npx prisma db seed`
