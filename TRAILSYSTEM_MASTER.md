# TrailSystem ERP â€” Documento Master
**Ãšltima atualizaÃ§Ã£o:** 2026-02-19
**Status:** Em desenvolvimento ativo â€” monorepo Cloudflare-native

---

## 1. CREDENCIAIS E ACESSOS\n\n> ⚠️ Dados sensíveis foram movidos para .secrets/TRAILSYSTEM_MASTER_PRIVATE.md (arquivo local, fora do Git).\n\n---\n\n## 2. RECURSOS CLOUDFLARE EM USO (novotraildesktop)

> Todos os recursos criados em 2026-02-19 com prefixo `novotraildesktop`

### D1 Database
| Nome | UUID | ObservaÃ§Ã£o |
|------|------|------------|
| **novotraildesktop-db** | `55379b36-355c-429a-b501-ade60c8c5c8a` | âœ… BANCO PRINCIPAL |

### KV Namespaces
| Binding | TÃ­tulo | ID |
|---------|--------|----|
| CACHE | `novotraildesktop-cache` | `e478cdb5adf5465db25655cac18eae02` |
| SESSIONS | `novotraildesktop-sessions` | `54a1ed65d14d40a4b4aeecfa478a77ae` |
| NUVEM_FISCAL_CACHE | `novotraildesktop-nuvemfiscal` | `879c23b8835b47f4a038031afbda505c` |

### R2 Buckets
| Binding | Nome | Uso |
|---------|------|-----|
| STORAGE | `novotraildesktop-storage` | Armazenamento geral |
| CERTIFICATES | `novotraildesktop-certificates` | Certificados digitais A1/A3 |
| IMAGES | `novotraildesktop-images` | Imagens |

### Queue
| Nome | Uso |
|------|-----|
| `novotraildesktop-tasks` | Processamento assÃ­ncrono (NF-e, estoque, etc.) |

---

## 3. STACK TECNOLÃ“GICA

### Backend (`erp-backend`)
- **Runtime:** Cloudflare Workers
- **Framework:** Hono
- **ORM:** Drizzle ORM
- **ValidaÃ§Ã£o:** Zod
- **AutenticaÃ§Ã£o:** JWT + bcryptjs
- **Testes:** Vitest

### Frontend (`erp-frontend`)
- **Framework:** React 18 + Vite
- **Routing:** React Router v7
- **State:** Zustand + TanStack Query
- **UI:** Tailwind CSS + shadcn/ui + Radix UI
- **Forms:** React Hook Form + Zod
- **Testes:** Vitest

### ServiÃ§os Cloudflare
| ServiÃ§o | Uso |
|---------|-----|
| D1 | Banco de dados principal (SQLite serverless) |
| KV | Cache de sessÃµes e dados frequentes |
| Durable Objects | Gerenciamento de sessÃµes em tempo real |
| R2 | Armazenamento de arquivos e certificados |
| Queues | Processamento assÃ­ncrono (NF-e, relatÃ³rios) |
| Analytics Engine | MÃ©tricas e logs de auditoria |

---

## 4. ESTRUTURA DO MONOREPO

```
Code1/
â”œâ”€â”€ erp-backend/          â† Cloudflare Worker (Hono)
â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”œâ”€â”€ modules/      â† auth, cadastros, comercial, fiscal, produtos, tenant
â”‚   â”‚   â”œâ”€â”€ shared/       â† database, services, middlewares, events
â”‚   â”‚   â””â”€â”€ index.ts
â”‚   â””â”€â”€ wrangler.toml
â”œâ”€â”€ erp-frontend/         â† React + Vite
â”‚   â””â”€â”€ src/
â”‚       â”œâ”€â”€ components/   â† cadastros, comercial, dashboard, ui, common
â”‚       â”œâ”€â”€ pages/        â† (app)/cadastros, (app)/comercial, (app)/dashboard
â”‚       â”œâ”€â”€ services/
â”‚       â”œâ”€â”€ hooks/
â”‚       â””â”€â”€ contexts/
â”œâ”€â”€ packages/
â”‚   â””â”€â”€ shared/           â† @erp/shared (tipos e utilitÃ¡rios compartilhados)
â”œâ”€â”€ package.json          â† Root workspace pnpm
â””â”€â”€ pnpm-workspace.yaml
```

---

## 5. ARQUITETURA â€” CLEAN ARCHITECTURE

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚     Presentation Layer (Hono)       â”‚
â”‚   Controllers â”‚ Routes â”‚ Middleware â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                   â”‚
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚       Application Layer             â”‚
â”‚     Services â”‚ DTOs â”‚ Mappers       â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                   â”‚
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚         Domain Layer                â”‚
â”‚  Entities â”‚ Use Cases â”‚ Interfaces  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                   â”‚
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚      Infrastructure Layer           â”‚
â”‚   DB â”‚ Repositories â”‚ CF Services   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## 6. SCHEMA DO BANCO (Multi-tenancy)

```sql
CREATE TABLE tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  subdomain TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL,   -- active, suspended, cancelled
  plan TEXT NOT NULL,     -- free, starter, professional, enterprise
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,     -- admin, manager, user
  status TEXT NOT NULL,   -- active, inactive
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE(email, tenant_id)
);
```

**Regra:** Toda nova tabela deve ter `tenant_id` para isolamento multi-tenant.

---

## 7. ENDPOINTS DA API

**Base URL local:** `http://localhost:8787/api/v1`

### Auth (pÃºblicos)
| MÃ©todo | Endpoint | DescriÃ§Ã£o |
|--------|----------|-----------|
| POST | `/auth/register` | Registrar usuÃ¡rio |
| POST | `/auth/login` | Login |

### Protegidos (requer Bearer token)
| MÃ©todo | Endpoint | DescriÃ§Ã£o |
|--------|----------|-----------|
| GET | `/protected/me` | Dados do usuÃ¡rio logado |

### Cadastros
| MÃ©todo | Endpoint |
|--------|----------|
| GET/POST | `/cadastros/clientes` |
| GET/PUT/DELETE | `/cadastros/clientes/:id` |
| GET/POST | `/cadastros/fornecedores` |
| GET/POST | `/cadastros/produtos` |
| GET/POST | `/cadastros/colaboradores` |

### Comercial
| MÃ©todo | Endpoint |
|--------|----------|
| GET/POST | `/comercial/...` |

### Fiscal (Nuvem Fiscal - Sandbox)
| MÃ©todo | Endpoint |
|--------|----------|
| `/nuvem-fiscal/...` | IntegraÃ§Ã£o NF-e/NFS-e |

---

## 8. INTEGRAÃ‡Ã•ES EXTERNAS

### Nuvem Fiscal (Fiscal)
- **Ambiente:** Sandbox
- **Client ID:** `[REMOVIDO - ver .secrets/TRAILSYSTEM_MASTER_PRIVATE.md]`
- **Client Secret:** `[REMOVIDO - ver .secrets/TRAILSYSTEM_MASTER_PRIVATE.md]`
- **API URL:** `https://api-sandbox.nuvemfiscal.com.br`
- **Token URL:** `https://api-sandbox.nuvemfiscal.com.br/oauth/token`

### API Brasil (planejado)
| ServiÃ§o | Custo |
|---------|-------|
| WhatsApp Baileys | R$9,90/conexÃ£o (5 conexÃµes planejadas) |
| SPC Boa Vista | R$5,00 |
| SCR Bacen + Score | R$6,19 |
| Protesto Nacional | R$1,72 |
| Define Limite PJ Plus | R$12,39 |

---

## 9. MÃ“DULOS â€” STATUS

| MÃ³dulo | Backend | Frontend | Status |
|--------|---------|----------|--------|
| Auth | âœ… | âœ… | Funcional |
| Cadastros | âœ… | âœ… (parcial) | Em desenvolvimento |
| Comercial | âœ… | âœ… (parcial) | Em desenvolvimento |
| Fiscal (Nuvem Fiscal) | âœ… | â¬œ | Backend pronto |
| Produtos | âœ… | â¬œ | Backend pronto |
| Tenant | âœ… | â¬œ | Backend pronto |

---

## 10. ROADMAP DE FASES

| Fase | Objetivo | Status |
|------|----------|--------|
| **Fase 1** | FundaÃ§Ã£o: Auth, D1, Multi-tenancy | âœ… ConcluÃ­da |
| **Fase 2** | MÃ³dulo Cadastros (blueprint) | ðŸ”„ Em andamento |
| **Fase 3** | MÃ³dulos Core: Financeiro + Comercial + Queues | â¬œ Planejado |
| **Fase 4** | ExpansÃ£o: Estoque, Fiscal, MigraÃ§Ã£o Neon | â¬œ Planejado |

---

## 11. COMANDOS ÃšTEIS

```powershell
# Iniciar desenvolvimento
pnpm dev:backend    # Backend na porta 8787
pnpm dev:frontend   # Frontend na porta 5173

# Deploy
pnpm build:backend  # Deploy Cloudflare Workers
pnpm build:frontend # Build + deploy Cloudflare Pages

# Banco de dados
cd erp-backend
pnpm db:generate    # Gerar migrations
pnpm db:migrate     # Aplicar migrations (local)

# Testes
pnpm test

# Cloudflare CLI
$env:CLOUDFLARE_API_TOKEN="[REMOVIDO - ver .secrets/TRAILSYSTEM_MASTER_PRIVATE.md]"
wrangler whoami
wrangler d1 list
wrangler kv:namespace list
```

---

## 12. SEGURANÃ‡A

- JWT com expiraÃ§Ã£o de 7 dias
- Senhas: bcryptjs (10 rounds)
- RBAC: admin, manager, user
- CORS configurado para localhost:5173, 5174, 3000
- Multi-tenancy: isolamento por `tenant_id`
- Input validation: Zod em todos os endpoints

---

## 13. DECISÃ•ES ARQUITETURAIS (ADRs)

| DecisÃ£o | Escolha | Motivo |
|---------|---------|--------|
| Backend runtime | Cloudflare Workers | Edge computing, escala global, sem servidor |
| Framework backend | Hono | Leve, type-safe, otimizado para Workers |
| ORM | Drizzle ORM | Type-safe, compatÃ­vel com D1, sem overhead |
| Banco principal | D1 (SQLite) | Serverless, baixo custo, integrado ao Workers |
| Banco futuro (Fase 4) | Neon (PostgreSQL) + Hyperdrive | Escala para volume maior de dados |
| Sessions | Durable Objects | Permite logout forÃ§ado, revogaÃ§Ã£o de sessÃ£o |
| Frontend build | Vite + React 18 | Velocidade de dev, compatÃ­vel com CF Pages |
| Monorepo | pnpm workspaces | Gerenciamento unificado de dependÃªncias |
| UI Components | shadcn/ui + Radix | AcessÃ­vel, sem abstraÃ§Ã£o excessiva, customizÃ¡vel |
| Template original | âš ï¸ DESCARTADO | Superado pelo frontend real (erp-frontend) |






