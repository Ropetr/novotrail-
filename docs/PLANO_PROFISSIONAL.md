# Plano Profissional de Organização e Continuidade

**Objetivo:** organizar tudo que já existe, eliminar redundâncias e garantir um caminho claro até a entrega final, cobrindo todas as pastas do projeto.

---

## Fase 0 — Organização imediata (estrutura e docs)

### 0.1 Estrutura do repositório (padronizar)
- Manter apenas:
  - `erp-backend/`
  - `erp-frontend/`
  - `packages/`
  - `docs/`
  - `README.md`
  - `package.json` / `pnpm-workspace.yaml`
- Remover arquivos soltos e duplicados.
- Criar índice central em `docs/README.md`.

### 0.2 Documentação oficial
- Consolidar documentos ativos em `docs/`.
- Remover duplicados ou rascunhos desatualizados.
- Normalizar encoding (UTF‑8, sem caracteres corrompidos).

Docs oficiais mínimos:
- `docs/OPERACAO_LOCAL.md`
- `docs/INTEGRACAO_FRONTEND_BACKEND.md`
- `docs/PADRAO_RESPOSTA_API.md`
- `docs/ENTREGA_CLIENTE.md`
- `docs/ARQUITETURA_RESUMO.md`
- `docs/PLANO_PROFISSIONAL.md` (este documento)

### 0.3 Segurança
- Nenhum token ou segredo em docs públicas.
- Tudo sensível em `.secrets/`.

---

## Fase 1 — Padronização técnica

### 1.1 Scripts e comandos
- Scripts oficiais documentados no `README.md` da raiz.
- Eliminar scripts redundantes ou inconsistentes.

### 1.2 Padrões de código
- Definir formatação única (lint/format) para frontend e backend.
- Garantir o mesmo padrão em todas as pastas.

### 1.3 Padrões visuais
- Consolidar tema (cores, espaçamento, tamanhos).
- Criar `docs/DESIGN_GUIDELINES.md` com:
  - cores oficiais
  - espaçamento padrão
  - altura padrão de headers/footers/tabelas
  - tipografia base

---

## Fase 2 — Estabilização funcional

### 2.1 Backend
- Migrations padronizadas e versionadas.
- Seed funcional e repetível.
- Respostas seguindo `docs/PADRAO_RESPOSTA_API.md`.

### 2.2 Frontend
- Telas principais funcionando com backend real.
- Remover dados hardcoded.
- Layouts e tabelas padronizados.

---

## Fase 3 — Organização da evolução

### 3.1 Roadmap único
- `PLANO_DE_ACAO.md` vira a fonte oficial de progresso.
- Atualização semanal com status real.

### 3.2 Controle de qualidade
- Checklist mínimo por módulo antes de marcar como pronto.
- Teste manual padronizado.

---

## Fase 4 — Continuidade até entrega

### 4.1 Módulos restantes
- Produtos (completo)
- Comercial (completo)
- Financeiro
- Estoque
- Fiscal
- Configurações e usuários

### 4.2 Entrega
- Checklist de deploy
- Documentação de cliente
- Processo de validação final

---

## Estado atual (resumo)
- Organização básica já iniciada.
- Padronização visual em andamento.
- CRUDs principais funcionando localmente.

---

## Próxima etapa imediata
1. Normalizar encoding dos docs (UTF‑8 limpo).
2. Criar `docs/DESIGN_GUIDELINES.md`.
3. Revisar `PLANO_DE_ACAO.md` e alinhar com este plano.

