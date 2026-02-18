# ERP Frontend - React + Vite + Tailwind CSS

Frontend do ERP construído com React, Vite, React Router e componentes shadcn/ui.

## Stack Tecnológica

- **React 18**: Biblioteca UI
- **Vite**: Build tool e dev server
- **React Router v7**: Roteamento
- **TanStack Query**: Data fetching e cache
- **Zustand**: State management
- **Tailwind CSS**: Styling
- **shadcn/ui**: Componentes reutilizáveis
- **React Hook Form**: Gerenciamento de formulários
- **Zod**: Validação de schemas

## Estrutura do Projeto

```
erp-frontend/
├── src/
│   ├── components/          # Componentes React
│   │   ├── ui/             # Componentes base (shadcn/ui)
│   │   ├── dashboard/      # Componentes do dashboard
│   │   └── cadastros/      # Componentes de cadastro
│   ├── contexts/           # React Contexts
│   ├── lib/                # Utilitários e helpers
│   ├── pages/              # Páginas da aplicação
│   │   └── (app)/
│   │       ├── dashboard/
│   │       └── cadastros/
│   ├── styles/             # Estilos globais
│   ├── App.tsx             # Componente raiz
│   └── main.tsx            # Entry point
├── public/                 # Assets estáticos
├── index.html
├── vite.config.ts
├── tailwind.config.ts
└── package.json
```

## Instalação

```bash
pnpm install
```

## Desenvolvimento

```bash
pnpm dev
```

O frontend estará disponível em `http://localhost:5173`

## Build

```bash
pnpm build
```

Os arquivos compilados estarão em `dist/`

## Rotas Disponíveis

- `/` - Redirect para dashboard
- `/dashboard` - Dashboard principal com KPIs e gráficos
- `/cadastros/clientes` - Gestão de clientes
- `/cadastros/fornecedores` - Gestão de fornecedores
- `/cadastros/produtos` - Gestão de produtos

## Componentes Principais

### Dashboard
- **KPI Cards**: Cartões com métricas principais
- **Sales Chart**: Gráfico de vendas
- **Category Chart**: Gráfico por categoria
- **Top Products**: Produtos mais vendidos
- **Top Clients**: Melhores clientes
- **Sellers Ranking**: Ranking de vendedores
- **Stalled Products**: Produtos parados

### Cadastros
- **Client Form/List**: Gestão de clientes
- **Supplier Form/List**: Gestão de fornecedores
- **Product Form/List**: Gestão de produtos

### UI Components (shadcn/ui)
- Accordion, Alert Dialog, Avatar
- Button, Card, Checkbox
- Dialog, Dropdown Menu, Form
- Input, Label, Select
- Table, Tabs, Toast
- Tooltip, e mais...

## Integração com Backend

O frontend se conecta ao backend através de proxy configurado no `vite.config.ts`:

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:8787',
    changeOrigin: true,
  },
}
```

Todas as requisições para `/api/*` serão redirecionadas para o backend em `localhost:8787`.

## Temas

O projeto suporta tema claro e escuro através do `next-themes`:

```tsx
import { ThemeProvider } from '@/components/theme-provider';

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      {/* seu app */}
    </ThemeProvider>
  );
}
```

## Formulários

Os formulários utilizam React Hook Form + Zod para validação:

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

const form = useForm({
  resolver: zodResolver(schema),
});
```

## Data Fetching

Use TanStack Query para gerenciar dados:

```tsx
import { useQuery } from '@tanstack/react-query';

function MyComponent() {
  const { data, isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => fetch('/api/v1/clients').then(r => r.json()),
  });
}
```

## State Management

Use Zustand para estado global:

```tsx
import { create } from 'zustand';

const useStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
```

## Deploy

### Cloudflare Pages

```bash
pnpm deploy
```

Isso irá:
1. Fazer o build do projeto
2. Fazer deploy para Cloudflare Pages usando Wrangler

### Outras plataformas

```bash
pnpm build
```

Depois faça upload da pasta `dist/` para sua plataforma de hospedagem.

## Próximos Passos

- [ ] Implementar autenticação com JWT
- [ ] Adicionar páginas de login/registro
- [ ] Conectar com backend real
- [ ] Adicionar testes com Vitest
- [ ] Implementar proteção de rotas
- [ ] Adicionar loading states
- [ ] Implementar error boundaries
- [ ] Adicionar paginação nas listas
- [ ] Implementar busca e filtros
- [ ] Adicionar responsividade mobile
