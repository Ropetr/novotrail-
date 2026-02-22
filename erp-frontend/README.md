# ERP Frontend - React + Vite

Frontend do ERP construído com React, Vite, React Router e componentes shadcn/ui.

## Stack
- React 18
- Vite
- React Router v7
- TanStack Query
- Zustand
- Tailwind CSS + shadcn/ui
- React Hook Form + Zod

## Configuração (local)

Crie um `.env` com:
```
VITE_API_URL=http://localhost:8787/api/v1
VITE_TENANT_ID=00000000-0000-0000-0000-000000000001
```

## Desenvolvimento
```bash
pnpm dev
```
Frontend em `http://localhost:5173`

## Estrutura
```
erp-frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   ├── contexts/
│   └── styles/
└── package.json
```

## Rotas principais
- `/login`
- `/dashboard`
- `/cadastros/clientes`
- `/cadastros/fornecedores`
- `/cadastros/produtos`
- `/cadastros/parceiros`
- `/cadastros/colaboradores`
- `/comercial/vendas`
- `/comercial/orcamentos`
- `/comercial/devolucoes`

## Integração com backend
As chamadas são feitas via `VITE_API_URL`.
O header `x-tenant-id` é enviado automaticamente quando `VITE_TENANT_ID` está definido.

## Observações
- Rotas privadas exigem token JWT
- Paginação e filtros já estão implementados nas listas

