# Checklist de Qualidade por Módulo

Este checklist define o mínimo para considerar um módulo “pronto”.

## 1) Cadastros (Clientes, Fornecedores, Parceiros, Colaboradores)
- Listagem com paginação e filtros
- CRUD completo (criar, editar, visualizar, excluir)
- Validações de campos principais
- Tratamento de erros visível
- Integração com backend (sem dados hardcoded)

## 2) Produtos
- CRUD de produtos
- Categoria e marca funcionando
- SKU/EAN e códigos validados
- Upload de imagem (quando implementado)

## 3) Comercial (Orçamentos / Vendas / Devoluções)
- Fluxo completo
- Cálculo de totais correto
- Status funcionando (rascunho → finalizado)
- Paginação e filtros

## 4) Dashboard
- Dados reais do backend
- KPIs atualizados
- Estados de loading e erro

## 5) Fiscal
- Configuração fiscal por tenant
- Integração com Nuvem Fiscal testada
- Logs e erros claros

## 6) Financeiro
- Contas a receber e pagar
- Fluxo de caixa
- Filtros por período

## 7) Estoque
- Movimentações
- Alertas de mínimo
- Sincronização com vendas

---

### Regras gerais
- Cada tela deve ter:
  - Loading
  - Error state
  - Empty state
- Nenhum token ou segredo em arquivos versionados
- Código formatado e lintado antes de marcar como pronto
