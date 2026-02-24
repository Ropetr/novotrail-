# ADR-002: Stack Tecnológica do TrailSystem ERP

**Data:** 2026-02-24
**Status:** Aceita

## Decisão
| Camada | Tecnologia | Motivo |
|--------|-----------|--------|
| Runtime | Cloudflare Workers | Edge computing, zero cold starts, custo R$25-75/mês |
| Framework API | Hono | Leve, type-safe, nativo para Workers |
| ORM | Drizzle ORM | Type-safe, compatível com PostgreSQL, sem overhead |
| Banco | Neon PostgreSQL | Serverless, branching por PR, sa-east-1 |
| Cache de conexão | Hyperdrive | Elimina latência TCP/TLS para Neon |
| Frontend | React 18 + Vite | NÃO migrar para Next.js |
| UI | Tailwind CSS + shadcn/ui + Radix | Acessível, customizável |
| State | Zustand + TanStack Query | Leve, sem boilerplate |
| Monorepo | pnpm workspaces + Turborepo | Build caching, task orchestration |
| CI/CD | GitHub Actions | Integração nativa com Wrangler e Neon |
| Validação | Zod | Schemas compartilhados entre front e back |
