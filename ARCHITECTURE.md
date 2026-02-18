# Arquitetura do ERP Cloudflare-Native

## Visão Geral

Este documento descreve a arquitetura do ERP construído sobre a plataforma Cloudflare Workers, seguindo os princípios de Clean Architecture e Domain-Driven Design (DDD).

## Stack Tecnológica

### Backend
- **Runtime**: Cloudflare Workers
- **Framework Web**: Hono (rápido, leve, type-safe)
- **ORM**: Drizzle ORM
- **Validação**: Zod
- **Autenticação**: JWT + bcryptjs

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v7
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Styling**: Tailwind CSS

### Serviços Cloudflare

1. **D1 Database**
   - Banco de dados SQLite distribuído
   - Multi-tenancy com isolamento por tenant
   - Schema: tenants, users (expansível)

2. **KV (Key-Value Store)**
   - Cache de sessões
   - Cache de consultas frequentes
   - Configurações por tenant

3. **Durable Objects**
   - Gerenciamento de sessões em tempo real
   - Estado consistente e distribuído
   - Cleanup automático de sessões expiradas

4. **Analytics Engine**
   - Métricas de uso
   - Tracking de eventos
   - Analytics por tenant

5. **R2 (Object Storage)**
   - Armazenamento de arquivos
   - Upload de documentos
   - Imagens e assets

6. **Queues**
   - Processamento assíncrono
   - Jobs em background
   - Integrações externas

## Arquitetura do Backend

### Clean Architecture - Camadas

```
┌─────────────────────────────────────────────────┐
│         Presentation Layer (Hono)               │
│  Controllers │ Routes │ Middlewares             │
└───────────────────┬─────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────┐
│         Application Layer                       │
│  Services │ DTOs │ Mappers                      │
└───────────────────┬─────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────┐
│         Domain Layer (Core)                     │
│  Entities │ Use Cases │ Repository Interfaces   │
└───────────────────┬─────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────┐
│         Infrastructure Layer                    │
│  DB │ Repositories │ Cloudflare Services        │
└─────────────────────────────────────────────────┘
```

### 1. Domain Layer (Núcleo)

**Responsabilidades:**
- Definir entidades de negócio
- Implementar regras de negócio (Use Cases)
- Definir interfaces de repositórios

**Estrutura:**
```
domain/
├── entities/
│   ├── Tenant.ts         # Entidade Tenant
│   └── User.ts           # Entidade User
├── repositories/
│   ├── ITenantRepository.ts
│   └── IUserRepository.ts
└── use-cases/
    ├── RegisterUser.ts   # Caso de uso: registrar usuário
    └── LoginUser.ts      # Caso de uso: login
```

**Princípios:**
- Sem dependências externas
- Lógica de negócio pura
- Testável sem infraestrutura

### 2. Application Layer

**Responsabilidades:**
- Orquestrar casos de uso
- Transformar dados (DTOs)
- Implementar serviços de aplicação

**Estrutura:**
```
application/
├── services/
│   └── AuthService.ts    # Serviço de autenticação (JWT, hash)
└── dto/
    └── # Data Transfer Objects
```

### 3. Infrastructure Layer

**Responsabilidades:**
- Implementar interfaces do domain
- Conectar com serviços externos
- Persistência de dados

**Estrutura:**
```
infrastructure/
├── database/
│   ├── schema.ts         # Schema Drizzle ORM
│   └── connection.ts     # Factory de conexão D1
├── repositories/
│   ├── TenantRepository.ts
│   └── UserRepository.ts
└── cloudflare/
    ├── types.ts          # Tipos Cloudflare Workers
    └── SessionManager.ts # Durable Object para sessões
```

### 4. Presentation Layer

**Responsabilidades:**
- Expor APIs HTTP
- Validar requisições
- Serializar respostas

**Estrutura:**
```
presentation/
├── controllers/
│   └── AuthController.ts # Controller de autenticação
├── routes/
│   └── auth.ts           # Rotas de autenticação
└── middlewares/
    └── auth.ts           # Middleware JWT
```

## Fluxo de Autenticação

### Registro de Usuário

```
1. POST /api/v1/auth/register
   ↓
2. AuthController.register()
   ↓
3. Validação com Zod
   ↓
4. RegisterUserUseCase.execute()
   ├─ Verifica se tenant existe e está ativo
   ├─ Verifica se email já existe
   └─ Cria usuário (hash da senha com bcrypt)
   ↓
5. AuthService.generateToken()
   ↓
6. Retorna { user, token }
```

### Login de Usuário

```
1. POST /api/v1/auth/login
   ↓
2. AuthController.login()
   ↓
3. Validação com Zod
   ↓
4. LoginUserUseCase.execute()
   ├─ Busca usuário por email + tenantId
   └─ Verifica status do usuário
   ↓
5. AuthService.comparePassword()
   ↓
6. AuthService.generateToken()
   ↓
7. SessionManager.createSession() (Durable Object)
   ↓
8. Retorna { user, token }
```

### Rotas Protegidas

```
1. GET /api/v1/protected/*
   ↓
2. authMiddleware
   ├─ Verifica header Authorization
   ├─ Valida token JWT
   └─ Injeta user no contexto
   ↓
3. Controller processa requisição
   ↓
4. Retorna resposta
```

## Multi-Tenancy

### Estratégia: Tenant por Subdomain

Cada tenant tem:
- **Subdomain único**: `{tenant}.erp.com`
- **Dados isolados**: Filtrados por `tenantId`
- **Configurações próprias**: Armazenadas no KV

### Schema do Banco

```sql
-- Tabela de Tenants
CREATE TABLE tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  subdomain TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL,      -- active, suspended, cancelled
  plan TEXT NOT NULL,         -- free, starter, professional, enterprise
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Tabela de Users
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,         -- admin, manager, user
  status TEXT NOT NULL,       -- active, inactive
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE(email, tenant_id)    -- Email único por tenant
);
```

## Segurança

### Autenticação
- JWT com expiração de 7 dias
- Senhas hasheadas com bcryptjs (10 rounds)
- Tokens armazenados em httpOnly cookies (futuro)

### Autorização
- Role-based access control (RBAC)
- Roles: admin, manager, user
- Validação de tenant em todas as requisições

### Proteções
- CORS configurado
- Rate limiting (futuro)
- Input validation com Zod
- SQL injection prevenido (Drizzle ORM)

## Monorepo

```
Code1/
├── package.json              # Root workspace
├── pnpm-workspace.yaml       # PNPM workspace config
├── ARCHITECTURE.md           # Este arquivo
├── erp-backend/
│   ├── src/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   ├── presentation/
│   │   └── index.ts
│   ├── wrangler.toml
│   ├── drizzle.config.ts
│   └── package.json
└── erp-frontend/
    ├── src/
    ├── package.json
    └── vite.config.ts
```

## Deploy

### Backend (Cloudflare Workers)
```bash
cd erp-backend
pnpm deploy
```

### Frontend (Cloudflare Pages)
```bash
cd erp-frontend
pnpm build
pnpm deploy
```

## Próximas Fases

### Fase 2: Gestão de Recursos Humanos
- CRUD de Funcionários
- Registro de ponto
- Folha de pagamento
- Férias e ausências

### Fase 3: Gestão Financeira
- Contas a pagar/receber
- Fluxo de caixa
- Relatórios financeiros
- Integrações bancárias

### Fase 4: CRM
- Gestão de clientes
- Pipeline de vendas
- Automação de marketing
- Analytics de vendas

### Fase 5: Estoque & Logística
- Controle de estoque
- Rastreamento de pedidos
- Integração com fornecedores
- Gestão de armazéns

## Métricas e Observabilidade

### Analytics Engine
- Tracking de eventos personalizados
- Métricas por tenant
- Dashboards em tempo real

### Logs
- Structured logging
- Error tracking
- Performance monitoring

## Escalabilidade

### Horizontal
- Cloudflare Workers escalam automaticamente
- Sem gerenciamento de servidores
- Global edge network

### Vertical
- Durable Objects para estado consistente
- D1 replicado globalmente
- KV com TTL automático

## Custo-Benefício

### Cloudflare Pro
- Workers: Ilimitado (até 50ms CPU)
- D1: 25GB storage, 5B reads/mês
- KV: 10GB storage, 100M reads/mês
- R2: 10GB storage
- Durable Objects: 1M requests/mês

### Estimativa para 100 usuários ativos
- ~$5-10/mês (Workers + D1)
- 99.9% uptime SLA
- Latência < 50ms globalmente
