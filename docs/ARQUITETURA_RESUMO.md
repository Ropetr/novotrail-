## Arquitetura (resumo simples)

### Frontend (erp-frontend)
- React + Vite
- Rotas com React Router
- UI baseada em componentes (shadcn/ui)
- Busca de dados com React Query

### Backend (erp-backend)
- Hono (Cloudflare Workers)
- Modulos principais:
  - Auth
  - Cadastros
  - Produtos
  - Comercial
  - Fiscal
- Banco D1 (Cloudflare)

### Fluxo basico
1. Usuario faz login
2. Token vai no header `Authorization`
3. Backend valida e retorna dados
4. Frontend mostra as telas

### Observacao
Este documento e um resumo para explicacao rapida.

