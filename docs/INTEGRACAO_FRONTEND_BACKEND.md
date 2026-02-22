## Integração Frontend x Backend (estado atual)

Este documento registra como a integração está funcionando hoje e o que precisa de atenção.

### 1) Envelope de resposta
O backend retorna:
```json
{ "success": true, "data": { "user": { ... }, "token": "..." } }
```

O frontend já trata os dois formatos (com ou sem envelope) em `erp-frontend/src/services/api.ts`:
- `response.data.data` (envelope)
- `response.data` (direto)

### 2) Resolução de tenant
Em desenvolvimento, o frontend envia o header `x-tenant-id` quando `VITE_TENANT_ID` está definido.
Isso está no interceptor do axios em `erp-frontend/src/services/api.ts`.

**Configuração recomendada (dev):**
- Definir `VITE_TENANT_ID` no `.env` do frontend
- Usar `VITE_API_URL` apontando para `http://localhost:8787/api/v1`

### 3) CORS e proxy
O frontend utiliza proxy do Vite para `/api` quando configurado, mas o padrão atual usa
`VITE_API_URL` direto para o backend.

---

## Pendências conhecidas

- Padronizar respostas no backend (seguir `docs/PADRAO_RESPOSTA_API.md` em todos os módulos)
- Garantir paginação e filtros consistentes entre módulos
- Ajustar possíveis diferenças de nomes de campos entre backend e frontend (ex: `stateRegistration`)

