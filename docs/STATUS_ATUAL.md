# Status Atual (Organização e Funcionamento)

## 1) Frontend

### Padronização visual (concluído hoje)
- Componentes base ajustados para altura `h-8`:
  - `src/components/ui/button.tsx` (tamanhos padrão e ícone)
  - `src/components/ui/input.tsx`
  - `src/components/ui/select.tsx`
  - `src/components/ui/table.tsx`
  - `src/components/ui/pagination.tsx`
- Forms comerciais (Orçamentos, Vendas, Devoluções):
  - Headers de cards com `h-8` e borda inferior.
  - Ícones de salvar/fechar alinhados no nível das abas.
  - Cabeçalho da tabela de itens (`Produto/Qtd/Unitário/Desc/Total`) com `h-8`.
  - `Unitário` e `Desc %` alinhados à esquerda no header.
  - Inputs numéricos sem setas/botões (+/−) em quantidade, unitário e desconto.
  - Dropdowns de busca (clientes/produtos/vendas) agora flutuantes (não empurram layout).
  - Busca de produtos aceita quantidade na mesma célula (ex: `3 cimento` ou `3x cimento`).
- Tabs e linhas do topo já seguem o padrão “chrome-like” definido anteriormente.

### Dashboard (dados estáticos)
Os cards ainda usam dados mockados/estáticos:
- `top-products.tsx` (const products)
- `top-clients.tsx` (const clients)
- `sellers-ranking.tsx` (const sellers)
- `stalled-products.tsx` (const products)
- `sales-chart.tsx` (const data)
- `category-chart.tsx` (const data)

### Comercial > Atendimento (mock)
- `pages/(app)/comercial/atendimento/page.tsx` usa:
  - `mockConversations`
  - `mockMessages`
  - `mockClientInfo`
  - `mockActivities`

### Cadastros / Comercial
Listas principais já integradas com hooks e backend.

---

## 2) Backend

### Migrations e Seed
- Scripts existentes:
  - `pnpm db:generate`
  - `pnpm db:migrate`
  - `pnpm seed`

### Endpoints principais
- Auth, Cadastros e Comercial estão definidos.

---

## 3) Próximas Ações (Fase 2)

1. Padronizar headers `h-8` e inputs numéricos em **todos** os forms restantes (cadastros e atendimento).
2. Revisar tabelas internas de outros módulos para manter `thead` em `h-8`.
3. Mapear telas faltantes no menu e criar páginas base (estrutura).
4. Substituir dados mockados do Dashboard por APIs reais.
5. Definir integração real para módulo Atendimento.
6. Revisar padrões de resposta no backend.
