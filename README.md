# TrailSystem ERP

ERP multi-tenant em monorepo (Cloudflare Workers + React/Vite). Este repositório contém:
- `erp-backend`: API em Cloudflare Workers (Hono + Drizzle)
- `erp-frontend`: SPA React (Vite + Tailwind + shadcn/ui)
- `packages/shared`: tipos e utilitários compartilhados

## Início Rápido (local)

```powershell
# Backend
cd "erp-backend"
pnpm db:migrate
pnpm seed
pnpm dev
```

Em outro terminal:

```powershell
# Frontend
cd "erp-frontend"
pnpm dev
```

Acesso:
- Frontend: `http://localhost:5173`
- API: `http://localhost:8787/api/v1`

## Documentação

- Operação local: `docs/OPERACAO_LOCAL.md`
- Integração front/back: `docs/INTEGRACAO_FRONTEND_BACKEND.md`
- Padrão de resposta da API: `docs/PADRAO_RESPOSTA_API.md`
- Entrega para cliente: `docs/ENTREGA_CLIENTE.md`
- Arquitetura (resumo): `docs/ARQUITETURA_RESUMO.md`

## Scripts do monorepo (raiz)

```powershell
pnpm dev:backend
pnpm dev:frontend
pnpm dev
pnpm build
pnpm test
```

## Estrutura

```
Code1/
├── erp-backend/
├── erp-frontend/
├── packages/
├── docs/
└── package.json
```

