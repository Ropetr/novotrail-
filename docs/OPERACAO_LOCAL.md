## Operação local (sem jargão)

Este guia serve para subir o sistema localmente e fazer uma demo funcional.

### 1) Backend
1. Abra um terminal na pasta `erp-backend`
2. Rode:
   - `pnpm db:migrate`
   - `pnpm dev`

### 2) Dados fictícios (seed)
Em outro terminal na pasta `erp-backend`:
```
pnpm seed
```

### 3) Frontend
Abra outro terminal na pasta `erp-frontend`:
```
pnpm dev
```

### 4) Acesso
Abra no navegador:
```
http://localhost:5173/login
```

Usuário demo:
```
admin@demo.com
123456
```

### 5) Telas principais
- `/dashboard`
- `/cadastros/clientes`
- `/cadastros/fornecedores`
- `/cadastros/produtos`
- `/comercial/atendimento`

---

## Checklist rápido (antes de apresentar)

1. Backend ligado
- `pnpm dev` (na pasta `erp-backend`)

2. Seed aplicado
- `pnpm seed` (na pasta `erp-backend`)

3. Frontend ligado
- `pnpm dev` (na pasta `erp-frontend`)

4. Login OK
- Usuário: `admin@demo.com`
- Senha: `123456`

5. Telas que devem abrir sem erro
- `/dashboard`
- `/cadastros/clientes`
- `/cadastros/fornecedores`
- `/cadastros/produtos`
- `/comercial/atendimento`

Se algum item falhar, não apresente ainda.

