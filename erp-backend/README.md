# ERP Backend - Cloudflare Workers + Hono

Backend do ERP construído com Clean Architecture, Hono e serviços da Cloudflare.

## Stack
- Cloudflare Workers + Wrangler
- Hono (HTTP)
- Drizzle ORM (D1)
- Zod (validação)
- JWT + bcryptjs (auth)

## Configuração (local)

1. Variáveis de ambiente
- Use `.dev.vars` (já existe) ou copie `.dev.vars.example`.

2. Banco D1 (local)
O projeto já está configurado para o banco `novotraildesktop-db` no `wrangler.toml`.

Para criar um novo banco (opcional):
```bash
wrangler d1 create novotraildesktop-db
```
Depois atualize `wrangler.toml` com o `database_id`.

3. Migrations
```bash
pnpm db:generate
pnpm db:migrate
```

4. Seed
```bash
pnpm seed
```

## Desenvolvimento
```bash
pnpm dev
```
Servidor em `http://localhost:8787`

## Endpoints principais
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/protected/me`

## Estrutura
```
erp-backend/
├── src/
│   ├── modules/          # auth, cadastros, comercial, fiscal, produtos, tenant
│   ├── shared/           # database, services, middlewares, events
│   └── index.ts
├── migrations/
├── wrangler.toml
└── package.json
```

## Deploy
```bash
pnpm deploy
```

## Notas
- As rotas protegidas exigem `Authorization: Bearer <token>`
- O tenant deve ser resolvido por subdomínio ou `x-tenant-id`

