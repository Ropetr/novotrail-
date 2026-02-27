# CLAUDE.md — NovoTrail ERP

## Visão Geral
ERP SaaS multi-tenant para distribuidoras de materiais de construção.
Cliente referência: PLANAC (50K itens/mês, 1.2M itens em 2 anos).
Proprietário: Rodrigo (não é programador — explicar tudo em português BR acessível).

## Stack Tecnológica
- **Backend:** Hono no Cloudflare Workers + Drizzle ORM
- **Banco:** Neon PostgreSQL (sa-east-1) via Hyperdrive — NÃO usa D1
- **Frontend:** React 18 + Vite + Tailwind CSS + shadcn/ui — NÃO usa Next.js
- **Monorepo:** pnpm workspaces + Turborepo
- **CI/CD:** GitHub Actions → Wrangler deploy
- **Repositório:** https://github.com/Ropetr/novotrail-.git

## Estrutura do Repositório
```
apps/api/            → Hono API Worker (wrangler.toml)
apps/web/            → React + Vite frontend
packages/types/      → Tipos TypeScript compartilhados
Apostila-ERP/        → Documentação de negócio (24 módulos — referência)
docs/decisions/      → ADRs (Architecture Decision Records)
docs/status.md       → Status atual do sprint/projeto
.github/workflows/   → CI/CD automático
```

## Recursos Cloudflare
| Recurso | ID | Uso |
|---------|----|-----|
| Worker API | novotrail-api | Backend Hono |
| Worker Web | novotrail-web | Frontend React |
| Hyperdrive | trailsystem-neon (05c0084...) | Ponte → Neon PostgreSQL |
| KV CACHE | e478cdb... | Cache geral |
| KV SESSIONS | 54a1ed6... | Sessões |
| R2 STORAGE | novotraildesktop-storage | Arquivos |
| R2 CERTIFICATES | novotraildesktop-certificates | Certificados A1 |
| Queue | novotrail-tasks | Processamento assíncrono |

## Banco Neon — 41 tabelas
- Auth (2): tenants, users
- Cadastros (6): clients, suppliers, partners, employees, client_credits, client_credit_movements
- Produtos (2): categories, products
- Comercial (8): quotes, quote_items, sales, sale_items, returns, return_items, sale_deliveries, sale_delivery_items
- CRM (4): crm_pipeline_stages, crm_opportunities, crm_activities, crm_scoring_rules
- Omnichannel (19): todas as tabelas omni_*

## Módulos — Status
| Módulo | Backend | Frontend | Schema |
|--------|---------|----------|--------|
| Auth | ✅ | ✅ | ✅ |
| Cadastros | ✅ | ✅ parcial | ✅ |
| Produtos | ✅ | ⬜ | ✅ |
| Comercial | ✅ | ✅ parcial | ✅ |
| Fiscal | ✅ | ⬜ | — |
| CRM | ✅ | ⬜ | ✅ |
| Omnichannel | ⬜ pendente | ⬜ mock | ✅ |

## Comandos
```bash
pnpm install                     # Instalar tudo
pnpm dev                         # Dev servers
pnpm turbo build                 # Build produção
pnpm turbo typecheck             # Verificar tipos
pnpm turbo lint                  # Verificar código
pnpm turbo test                  # Rodar testes
cd apps/api && pnpm db:generate  # Gerar migration
cd apps/api && pnpm db:push      # Aplicar no Neon (dev)
cd apps/api && pnpm deploy       # Deploy API
cd apps/web && pnpm deploy       # Deploy Frontend
```

## Regras Obrigatórias
1. Sempre responder em português brasileiro
2. Nunca alterar código sem autorização do Rodrigo
3. Commits: Conventional Commits (feat:, fix:, docs:, refactor:)
4. Schema: editar em apps/api/src/modules/*/infrastructure/schema.ts
5. Nunca alterar banco diretamente — sempre via Drizzle
6. Consultar Apostila-ERP/ antes de implementar qualquer módulo
7. Documentar decisões em docs/decisions/
8. CRM flat no Comercial (sem 3º nível no sidebar)

## API em Produção
- URL: https://novotrail-api.planacacabamentos.workers.dev
- Login teste: admin@demo.com / 123456
- Tenant: 00000000-0000-0000-0000-000000000001
