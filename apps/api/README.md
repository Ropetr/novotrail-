# ERP Backend - Cloudflare Workers + Hono

Backend do ERP construído com Clean Architecture, Hono e serviços da Cloudflare.

## Stack
- Cloudflare Workers + Wrangler
- Hono (HTTP framework)
- Drizzle ORM (Neon PostgreSQL via Hyperdrive)
- Zod (validacao de input)
- JWT + bcryptjs (autenticacao)

## Banco de Dados

O projeto utiliza **Neon PostgreSQL** (regiao sa-east-1) acessado via **Cloudflare Hyperdrive**
(binding `HYPERDRIVE`). Nao utiliza D1.

### Configuracao local

1. Copie `.dev.vars.example` para `.dev.vars` e preencha as variaveis:
   - `DATABASE_URL` — connection string do Neon
   - `JWT_SECRET` — segredo para assinar tokens JWT

2. O binding `HYPERDRIVE` e simulado localmente via `wrangler dev` usando
   a variavel `DATABASE_URL` definida em `.dev.vars`.

### Migrations com Drizzle

```bash
# Gerar arquivos de migration a partir do schema
pnpm db:generate

# Aplicar migrations no banco Neon (ambiente de desenvolvimento)
pnpm db:push

# Rodar migrations versionadas (producao)
pnpm db:migrate:neon

# Verificar inconsistencias no schema
pnpm db:check

# Abrir Drizzle Studio (GUI para o banco)
pnpm db:studio
```

### Seed

```bash
pnpm seed
```

## Desenvolvimento

```bash
pnpm dev
```

Servidor disponivel em `http://localhost:8787`.

## Endpoints principais

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET  /api/v1/protected/me`

Documentacao completa dos endpoints disponivel na Apostila-ERP/ na raiz do repositorio.

## Estrutura

```
apps/api/
├── src/
│   ├── modules/          # auth, cadastros, comercial, fiscal, produtos, tenant, crm, omnichannel
│   │   └── <modulo>/
│   │       ├── domain/           # entidades e interfaces de repositorios
│   │       ├── infrastructure/   # schema Drizzle, repositorios concretos
│   │       └── presentation/     # controllers HTTP e rotas Hono
│   ├── shared/           # database, services, middlewares, events
│   └── index.ts
├── migrations/           # arquivos SQL gerados pelo Drizzle
├── wrangler.toml
└── package.json
```

## Deploy

```bash
pnpm deploy
```

## Notas

- Rotas protegidas exigem `Authorization: Bearer <token>`
- O tenant e resolvido pelo header `x-tenant-id` ou por subdominio
- Todos os dados sao isolados por `tenantId` — nenhuma query acessa dados de outro tenant
