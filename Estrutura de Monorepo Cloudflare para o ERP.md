# Estrutura de Monorepo Cloudflare para o ERP

Esta é a estrutura de pastas recomendada para organizar seu projeto ERP com frontend e backend desacoplados.

```
Code1/
├── .claude/                                    (agentes de IA)
│   ├── CLAUDE.md
│   └── agents/
│       ├── tech-lead.md
│       ├── architect.md
│       ├── backend-developer.md
│       ├── frontend-developer.md
│       ├── database-manager.md
│       ├── api-integrator.md
│       ├── code-reviewer.md
│       ├── tester.md
│       ├── security-analyst.md
│       ├── debugger.md
│       ├── devops-engineer.md
│       ├── performance-optimizer.md
│       ├── doc-writer.md
│       ├── ux-designer.md
│       ├── git-manager.md
│       └── refactoring-specialist.md
│
├── erp-frontend/                               (Next.js + Cloudflare Pages)
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (app)/
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── cadastros/
│   │   │   │   ├── clientes/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── fornecedores/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── produtos/
│   │   │   │       └── page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/
│   │   ├── dashboard/
│   │   ├── cadastros/
│   │   └── auth/
│   ├── lib/
│   │   ├── api-client.ts          (cliente HTTP para comunicar com o backend)
│   │   └── auth.ts                (hooks e utilitários de autenticação)
│   ├── contexts/
│   │   └── auth-context.tsx       (contexto global de autenticação)
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── next.config.mjs
│   ├── wrangler.json              (configuração do Cloudflare Pages)
│   └── .env.local.example
│
├── erp-backend/                                (Hono + Cloudflare Workers)
│   ├── src/
│   │   ├── domain/                (Camada de Domínio - Lógica de Negócio)
│   │   │   ├── entities/
│   │   │   │   ├── user.ts
│   │   │   │   ├── tenant.ts
│   │   │   │   ├── client.ts
│   │   │   │   ├── supplier.ts
│   │   │   │   └── product.ts
│   │   │   ├── value-objects/
│   │   │   └── errors/
│   │   │       └── domain-error.ts
│   │   ├── application/           (Camada de Aplicação - Casos de Uso)
│   │   │   ├── use-cases/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── register-user.ts
│   │   │   │   │   └── login-user.ts
│   │   │   │   └── cadastros/
│   │   │   │       ├── create-client.ts
│   │   │   │       ├── get-client.ts
│   │   │   │       └── list-clients.ts
│   │   │   ├── dto/
│   │   │   └── services/
│   │   ├── infrastructure/        (Camada de Infraestrutura - Serviços Cloudflare)
│   │   │   ├── database/
│   │   │   │   ├── schema.ts      (Drizzle ORM schema)
│   │   │   │   └── migrations/
│   │   │   ├── cache/
│   │   │   │   └── kv-cache.ts    (Cloudflare KV)
│   │   │   ├── queue/
│   │   │   │   └── queue-producer.ts (Cloudflare Queues)
│   │   │   ├── durable-objects/
│   │   │   │   └── session-manager.ts (Durable Objects para sessões)
│   │   │   └── analytics/
│   │   │       └── analytics-logger.ts (Analytics Engine)
│   │   ├── presentation/          (Camada de Apresentação - Rotas HTTP)
│   │   │   ├── routes/
│   │   │   │   ├── auth.ts
│   │   │   │   └── cadastros.ts
│   │   │   ├── middleware/
│   │   │   │   ├── auth-middleware.ts
│   │   │   │   └── error-handler.ts
│   │   │   └── controllers/
│   │   ├── index.ts               (Entrada do Worker Hono)
│   │   └── env.ts                 (Tipos de variáveis de ambiente)
│   ├── tests/
│   │   ├── unit/
│   │   └── integration/
│   ├── package.json
│   ├── tsconfig.json
│   ├── wrangler.toml              (configuração do Cloudflare Workers)
│   ├── drizzle.config.ts          (configuração do Drizzle ORM)
│   ├── .env.example
│   └── vitest.config.ts           (configuração de testes)
│
├── Template-Trailsystem-Completo-main/        (referência - UI original)
│
├── plano-de-transformacao-cloudflare-pro.md   (este plano)
│
└── README.md                                   (documentação do projeto)
```

## Explicação das Camadas do Backend

A arquitetura do backend segue **Clean Architecture** com as seguintes camadas:

### 1. **Domain Layer** (Camada de Domínio)
Contém a lógica de negócio pura, independente de frameworks ou tecnologias. Aqui vivem as entidades, value objects e regras de negócio.

**Exemplo:** A entidade `Client` com validações de CNPJ, limite de crédito, etc.

### 2. **Application Layer** (Camada de Aplicação)
Orquestra os casos de uso (use cases) que implementam os fluxos de negócio. Aqui é onde os DTOs (Data Transfer Objects) são usados para comunicação entre camadas.

**Exemplo:** O caso de uso `CreateClient` que valida os dados, cria a entidade e a persiste.

### 3. **Infrastructure Layer** (Camada de Infraestrutura)
Implementa a comunicação com serviços externos e recursos da Cloudflare. Aqui ficam as implementações do Drizzle ORM, KV, Queues, Durable Objects, etc.

**Exemplo:** A classe `KVCache` que implementa a interface de cache usando Cloudflare KV.

### 4. **Presentation Layer** (Camada de Apresentação)
Define as rotas HTTP, controllers e middleware. Aqui é onde o Hono expõe os endpoints da API.

**Exemplo:** A rota POST `/api/clients` que chama o caso de uso `CreateClient`.

## Próximos Passos

1. Crie as pastas `erp-frontend` e `erp-backend` dentro de `Code1/`.
2. Copie os componentes relevantes do `Template-Trailsystem-Completo-main` para o `erp-frontend`.
3. Use o prompt fornecido no plano para iniciar a Fase 1 com os agentes.
