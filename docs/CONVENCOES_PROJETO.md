# Convenções do Projeto

Este documento define padrões para manter o repositório organizado e fácil de escalar.

## 1) Estrutura de pastas

### Raiz
- `erp-backend/`
- `erp-frontend/`
- `packages/`
- `docs/`
- `README.md`

### Backend (`erp-backend`)
- `src/modules/` → módulos de negócio (auth, cadastros, comercial, fiscal, produtos, tenant)
- `src/shared/` → utilitários e infraestrutura compartilhada
- `migrations/` → migrações do banco

### Frontend (`erp-frontend`)
- `src/components/` → componentes reutilizáveis
- `src/pages/` → páginas (rotas)
- `src/hooks/` → hooks de dados e estado
- `src/services/` → chamadas de API
- `src/contexts/` → contextos globais
- `src/styles/` → estilos globais

---

## 2) Nomenclatura de arquivos
- Componentes React: `kebab-case.tsx`
- Hooks: `use-*.ts`
- Services: `*.ts`
- Pastas por módulo: `cadastros/`, `comercial/`, `produtos/`, `fiscal/`

---

## 3) Padrões visuais
- Seguir `docs/DESIGN_GUIDELINES.md`

---

## 4) Documentação
- Tudo deve ficar em `docs/`
- Não criar arquivos soltos na raiz
- Documentos antigos vão para `docs/legacy/` ou são removidos

---

## 5) Segurança
- Nunca versionar `.env`, `.dev.vars` ou qualquer segredo
- Usar `.secrets/` para arquivos locais sensíveis
