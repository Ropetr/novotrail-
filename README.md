# TrailSystem ERP

ERP SaaS multi-tenant para distribuidoras. Monorepo com Turborepo + pnpm.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| API | Cloudflare Workers + Hono + Drizzle ORM |
| Banco | Neon PostgreSQL (via Hyperdrive) |
| Frontend | React 18 + Vite + Tailwind CSS + shadcn/ui |
| Cache/Sessions | Cloudflare KV |
| Storage | Cloudflare R2 |
| Queues | Cloudflare Queues |
| Monorepo | pnpm workspaces + Turborepo |

## Estrutura

```
trailsystem/
├── apps/
│   ├── api/              # Cloudflare Worker (Hono + Drizzle)
│   └── web/              # React 18 SPA (Vite + shadcn/ui)
├── packages/
│   └── types/            # Zod schemas + TypeScript types
├── Apostila-ERP/         # Documentação dos 24 módulos
├── turbo.json
└── pnpm-workspace.yaml
```

## Início Rápido

```powershell
# Instalar dependências
pnpm install

# Dev (API + Web em paralelo)
pnpm dev

# Ou separadamente:
pnpm dev:api
pnpm dev:web
```

## Acesso

- Frontend: `http://localhost:5173`
- API: `http://localhost:8787/api/v1`

## Scripts

```powershell
pnpm dev          # Inicia API + Web
pnpm build        # Build de todos os pacotes
pnpm test         # Testes
pnpm type-check   # Verificação de tipos
pnpm test:e2e     # Testes E2E (Playwright)
```

## Documentação

A especificação completa dos 24 módulos está em `Apostila-ERP/`.
