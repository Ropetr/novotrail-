# ERP Backend - Cloudflare Workers + Hono

Backend do ERP construído com Clean Architecture, Hono e serviços da Cloudflare.

## Arquitetura

Este projeto segue os princípios da Clean Architecture e Domain-Driven Design (DDD):

### Camadas

1. **Domain Layer** (`src/domain/`)
   - **Entities**: Modelos de negócio puros (Tenant, User)
   - **Repositories**: Interfaces dos repositórios
   - **Use Cases**: Lógica de negócio (RegisterUser, LoginUser)

2. **Application Layer** (`src/application/`)
   - **Services**: Serviços de aplicação (AuthService)
   - **DTOs**: Objetos de transferência de dados

3. **Infrastructure Layer** (`src/infrastructure/`)
   - **Database**: Schema Drizzle ORM e conexões
   - **Repositories**: Implementações concretas dos repositórios
   - **Cloudflare**: Integrações com serviços Cloudflare (D1, KV, Durable Objects)

4. **Presentation Layer** (`src/presentation/`)
   - **Controllers**: Controladores HTTP
   - **Routes**: Definições de rotas
   - **Middlewares**: Middlewares (autenticação, etc.)

## Serviços Cloudflare Utilizados

- **D1**: Banco de dados SQLite distribuído (multi-tenancy)
- **KV**: Cache de sessões e dados
- **Durable Objects**: Gerenciamento de sessões em tempo real
- **Analytics Engine**: Métricas e analytics
- **R2**: Armazenamento de arquivos
- **Queues**: Processamento assíncrono de tarefas

## Instalação

```bash
pnpm install
```

## Configuração

1. Copie `.dev.vars.example` para `.dev.vars`:
```bash
cp .dev.vars.example .dev.vars
```

2. Preencha as variáveis de ambiente no `.dev.vars`

3. Crie o banco de dados D1:
```bash
wrangler d1 create erp-db
```

4. Atualize o `database_id` no `wrangler.toml` com o ID retornado

5. Gere e aplique as migrações:
```bash
pnpm db:generate
pnpm db:migrate
```

## Desenvolvimento

```bash
pnpm dev
```

O servidor estará disponível em `http://localhost:8787`

## Endpoints de Autenticação

### POST /api/v1/auth/register
Registra um novo usuário.

**Body:**
```json
{
  "tenantId": "uuid",
  "email": "user@example.com",
  "password": "senha123456",
  "name": "Nome do Usuário",
  "role": "user"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "tenantId": "uuid",
      "email": "user@example.com",
      "name": "Nome do Usuário",
      "role": "user",
      "status": "active"
    },
    "token": "jwt-token"
  }
}
```

### POST /api/v1/auth/login
Faz login de um usuário.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "senha123456",
  "tenantId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "jwt-token"
  }
}
```

### GET /api/v1/protected/me
Retorna dados do usuário autenticado (requer token).

**Headers:**
```
Authorization: Bearer <token>
```

## Testes

```bash
pnpm test
```

## Deploy

```bash
pnpm deploy
```

## Estrutura do Projeto

```
erp-backend/
├── src/
│   ├── domain/              # Regras de negócio
│   │   ├── entities/
│   │   ├── repositories/
│   │   └── use-cases/
│   ├── application/         # Serviços de aplicação
│   │   ├── dto/
│   │   └── services/
│   ├── infrastructure/      # Implementações técnicas
│   │   ├── database/
│   │   ├── repositories/
│   │   └── cloudflare/
│   ├── presentation/        # Camada de apresentação
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── middlewares/
│   └── index.ts            # Entry point
├── test/                    # Testes
├── migrations/             # Migrações do banco
├── wrangler.toml          # Configuração Cloudflare
├── drizzle.config.ts      # Configuração Drizzle ORM
└── package.json
```

## Próximos Passos

- [ ] Implementar CRUD de Tenants
- [ ] Adicionar refresh tokens
- [ ] Implementar rate limiting
- [ ] Adicionar validação de subdomain único
- [ ] Configurar Analytics Engine para métricas
- [ ] Implementar upload de arquivos com R2
- [ ] Criar sistema de filas para tarefas assíncronas
- [ ] Adicionar testes unitários e de integração
- [ ] Configurar CI/CD
