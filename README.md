# 🏗️ TrailSystem ERP — NovoTrail

ERP SaaS multi-tenant para distribuidoras de materiais de construção.

**Stack:** Cloudflare Workers (Hono) + Neon PostgreSQL (Hyperdrive) + React 18 + Vite

---

## 🚀 Quick Start

```bash
pnpm install       # Instalar dependências
pnpm dev           # API (8787) + Frontend (5173)
```

## 📦 Estrutura

```
apps/api/            → Backend Hono (Cloudflare Workers)
apps/web/            → Frontend React 18 + Vite + shadcn/ui
packages/types/      → Tipos TypeScript compartilhados
Apostila-ERP/        → Documentação de negócio (24 módulos)
docs/decisions/      → ADRs (decisões técnicas)
docs/status.md       → Status atual do projeto
.github/workflows/   → CI/CD (GitHub Actions)
```

## 🗃️ Banco de Dados

**Neon PostgreSQL** (sa-east-1) conectado via **Cloudflare Hyperdrive**.

```bash
pnpm db:generate     # Gerar migration após alterar schema
pnpm db:push         # Aplicar schema no Neon (dev)
```

## 🔧 Comandos

| Comando | O que faz |
|---------|-----------|
| `pnpm dev` | Inicia API + Frontend |
| `pnpm build` | Build de produção |
| `pnpm typecheck` | Verifica tipos TypeScript |
| `pnpm lint` | Verifica padrões de código |
| `pnpm test` | Roda testes |
| `pnpm deploy:api` | Deploy da API no Cloudflare |
| `pnpm deploy:web` | Deploy do Frontend no Cloudflare |

## 📋 Módulos (41 tabelas)

| Módulo | Backend | Frontend | Status |
|--------|---------|----------|--------|
| Auth | ✅ | ✅ | Funcional |
| Cadastros | ✅ | ✅ parcial | Funcional |
| Produtos | ✅ | ⬜ | Backend pronto |
| Comercial | ✅ | ✅ parcial | Funcional |
| Fiscal | ✅ | ⬜ | Backend pronto |
| CRM | ✅ | ⬜ | Backend pronto |
| Omnichannel | 🔨 | ⬜ | Em desenvolvimento |

## 🔒 Regras

- Commits: Conventional Commits (`feat:`, `fix:`, `docs:`)
- Schema: via Drizzle ORM (nunca alterar banco direto)
- Documentação: `Apostila-ERP/` é referência obrigatória
- Decisões: registrar em `docs/decisions/`
