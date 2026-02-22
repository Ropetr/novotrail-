# Plano de Ação — TrailSystem ERP
**Data:** 2026-02-19
**Status:** Aprovado para execução
**Objetivo:** Sistema SaaS ERP completo, funcional em produção

---

## 📊 Situação Atual (Diagnóstico)

### O que JÁ EXISTE (código pronto)
| Camada | O que tem |
|--------|-----------|
| Backend | Auth, Cadastros, Produtos, Comercial (Orçamentos/Vendas/Devoluções), Fiscal (Nuvem Fiscal) |
| Frontend | Login, Dashboard (dados estáticos), Cadastros (Clientes/Fornecedores/Parceiros/Colaboradores), Comercial (Vendas/Orçamentos/Devoluções) |
| Banco | Schema completo definido no Drizzle — mas só `tenants` e `users` existem no D1 |
| Infra | Cloudflare Workers, D1, KV, R2, Durable Objects, Queues — tudo configurado |

### O que está QUEBRADO
- Migrations pendentes: 14 tabelas no código, 2 no banco → **todos os CRUDs falham**
- Dashboard com dados estáticos (hardcoded)
- CLAUDE.md desatualizado (paths quebrados)
- Módulo de produtos sem frontend completo
- Sem módulo Financeiro
- Sem módulo de Estoque
- Sem testes automatizados funcionando
- Sem deploy em produção configurado

---

## 🗂️ Estrutura de Etapas

```
ETAPA 0 → Base (corrigir o que está quebrado)
ETAPA 1 → Cadastros completos e funcionando
ETAPA 2 → Produtos completo
ETAPA 3 → Comercial completo (Orçamentos → Vendas → Devoluções)
ETAPA 4 → Dashboard com dados reais
ETAPA 5 → Módulo Financeiro
ETAPA 6 → Módulo Estoque
ETAPA 7 → Módulo Fiscal (NF-e)
ETAPA 8 → Configurações e Usuários
ETAPA 9 → Produção e Deploy
```

---

## ETAPA 0 — Base (Fazer o Sistema Funcionar)
**Prioridade: CRÍTICA — Desbloqueia tudo**

### 0.1 Migrations do Banco D1
- Gerar nova migration com todas as tabelas pendentes
- Aplicar no D1 local e produção
- Tabelas: `clients`, `suppliers`, `partners`, `employees`, `categories`, `products`, `quotes`, `quote_items`, `sales`, `sale_items`, `returns`, `return_items`
- Resultado: CRUDs todos desbloqueados

### 0.2 Seed de Dados para Desenvolvimento
- Criar seed com tenant padrão
- Criar seed com usuário admin
- Criar seed com dados de exemplo (clientes, produtos, vendas)
- Resultado: Ambiente de desenvolvimento com dados reais para testar

### 0.3 Atualizar CLAUDE.md
- Corrigir paths das skills (estavam apontando para `/home/ubuntu/...`)
- Atualizar contexto do projeto com stack atual
- Documentar comandos e convenções do projeto

### 0.4 Configurar .env do Frontend
- Garantir `VITE_API_URL` apontando para o backend correto
- Verificar que o tenant ID padrão está configurado

**Entregável:** Sistema rodando end-to-end localmente com dados reais

---

## ETAPA 1 — Cadastros Completos
**Dependência: Etapa 0**

### 1.1 Clientes
- [ ] Testar CRUD completo (list, create, getById, update, delete)
- [ ] Validar busca e paginação
- [ ] Validar máscara CPF/CNPJ no formulário
- [ ] Validar busca de CEP automática
- [ ] Validar busca de CNPJ automática
- [ ] Testar exportação para Fornecedor/Parceiro

### 1.2 Fornecedores
- [ ] Testar CRUD completo
- [ ] Validar formulário e máscaras

### 1.3 Parceiros
- [ ] Testar CRUD completo
- [ ] Validar taxa de comissão

### 1.4 Colaboradores
- [ ] Testar CRUD completo
- [ ] Validar vínculo com usuário do sistema

### 1.5 Usuários
- [ ] Criar frontend da página de usuários (existe pasta mas sem componentes)
- [ ] CRUD de usuários por tenant
- [ ] Gerenciar roles (admin, manager, user)
- [ ] Reset de senha

**Entregável:** Módulo Cadastros 100% funcional com dados reais

---

## ETAPA 2 — Produtos Completo
**Dependência: Etapa 0**

### 2.1 Categorias
- [ ] Criar frontend de categorias (página + componentes + hooks + service)
- [ ] CRUD de categorias com hierarquia (categoria pai/filho)

### 2.2 Produtos
- [ ] Criar frontend de produtos completo (existe componente parcial)
- [ ] CRUD completo com categoria, preço custo/venda
- [ ] Campos: código, nome, SKU, código de barras, unidade, estoque mínimo
- [ ] Filtros por categoria e status
- [ ] Upload de imagem do produto (R2)

**Entregável:** Módulo Produtos completo, integrado ao banco

---

## ETAPA 3 — Comercial Completo
**Dependência: Etapas 1 e 2 (precisa de clientes e produtos)**

### 3.1 Orçamentos
- [ ] Testar CRUD de orçamentos
- [ ] Adicionar/remover itens com busca de produto
- [ ] Cálculo automático de totais e desconto
- [ ] Status: rascunho → enviado → aprovado/rejeitado
- [ ] Converter orçamento em venda

### 3.2 Vendas
- [ ] Testar CRUD de vendas
- [ ] Fluxo completo: criar venda com itens
- [ ] Atualizar estoque ao confirmar venda (via Queue)
- [ ] Status: pendente → confirmado → faturado → cancelado
- [ ] Formas de pagamento

### 3.3 Devoluções
- [ ] Testar CRUD de devoluções
- [ ] Vinculação com venda original
- [ ] Reverter estoque ao aprovar devolução
- [ ] Status: pendente → aprovado/rejeitado → concluído

### 3.4 Atendimento
- [ ] Definir escopo do módulo de atendimento
- [ ] Implementar (provavelmente histórico de interações com cliente)

**Entregável:** Fluxo comercial completo: Orçamento → Venda → Devolução

---

## ETAPA 4 — Dashboard com Dados Reais
**Dependência: Etapas 1, 2 e 3**

### 4.1 Endpoints de Analytics no Backend
- [ ] `GET /api/v1/dashboard/kpis` — faturamento, ticket médio, qtd vendas, conversão
- [ ] `GET /api/v1/dashboard/sales-chart` — vendas por período (diário/semanal/mensal)
- [ ] `GET /api/v1/dashboard/top-clients` — top clientes por faturamento
- [ ] `GET /api/v1/dashboard/top-products` — top produtos mais vendidos
- [ ] `GET /api/v1/dashboard/sellers-ranking` — ranking de vendedores
- [ ] `GET /api/v1/dashboard/category-chart` — vendas por categoria
- [ ] `GET /api/v1/dashboard/stalled-products` — produtos sem giro

### 4.2 Frontend — Conectar ao Backend
- [ ] Substituir dados hardcoded por chamadas à API
- [ ] Implementar filtros de período funcionando
- [ ] Loading states e tratamento de erro
- [ ] Usar Cloudflare Analytics Engine para métricas

**Entregável:** Dashboard 100% com dados reais

---

## ETAPA 5 — Módulo Financeiro
**Dependência: Etapa 3 (vendas geram contas a receber)**

### 5.1 Backend — Novo Módulo
- [ ] Criar módulo `financeiro` no backend
- [ ] Schema: `accounts_receivable` (contas a receber), `accounts_payable` (contas a pagar), `cash_flow` (lançamentos de caixa)
- [ ] CRUD de contas a receber (geradas automaticamente pelas vendas via Queue)
- [ ] CRUD de contas a pagar (geradas por compras)
- [ ] Lançamentos manuais de caixa
- [ ] Baixa de pagamentos

### 5.2 Frontend — Módulo Financeiro
- [ ] Criar estrutura de pastas e rotas
- [ ] Tela de contas a receber com filtros (vencidas, a vencer, pagas)
- [ ] Tela de contas a pagar
- [ ] Tela de fluxo de caixa (extrato por período)
- [ ] KPIs financeiros básicos

### 5.3 Integração com Comercial
- [ ] Ao confirmar venda → criar automaticamente conta a receber (Queue)
- [ ] Ao aprovar devolução → estornar ou criar crédito

**Entregável:** Contas a receber/pagar e fluxo de caixa funcionando

---

## ETAPA 6 — Módulo Estoque
**Dependência: Etapa 2 (produtos) e Etapa 3 (vendas movimentam estoque)**

### 6.1 Backend — Controle de Estoque
- [ ] Schema: `stock_movements` (movimentações de estoque)
- [ ] Tipos de movimentação: entrada, saída, ajuste, devolução
- [ ] Durable Object para garantir consistência do saldo em tempo real
- [ ] Alertas de estoque mínimo (via Queue)

### 6.2 Frontend
- [ ] Tela de movimentações de estoque
- [ ] Entrada manual de estoque (compra)
- [ ] Ajuste de inventário
- [ ] Relatório de posição de estoque
- [ ] Alertas de produto abaixo do estoque mínimo

**Entregável:** Estoque controlado automaticamente pelas vendas

---

## ETAPA 7 — Módulo Fiscal (NF-e)
**Dependência: Etapas 3 e 5 (venda faturada gera NF-e)**

### 7.1 Configuração da Empresa
- [ ] Dados fiscais do tenant: CNPJ, IE, CNAE, regime tributário
- [ ] Upload de certificado digital A1 (armazenar no R2 CERTIFICATES)
- [ ] Configurar credenciais Nuvem Fiscal por tenant

### 7.2 Emissão NF-e
- [ ] Ao faturar venda → gerar NF-e automaticamente (via Queue)
- [ ] Tela de gestão de NF-e por venda
- [ ] Download do XML e DANFE em PDF
- [ ] Status: pendente → autorizada → cancelada/denegada
- [ ] Armazenar XML no R2 STORAGE

### 7.3 Consultas Fiscais
- [ ] Consultar status de NF-e
- [ ] Cancelamento de NF-e
- [ ] Carta de correção (CC-e)

**Entregável:** Emissão de NF-e integrada ao fluxo de venda

---

## ETAPA 8 — Configurações e Multi-tenant
**Pode ser feita em paralelo com etapas anteriores**

### 8.1 Perfil e Configurações do Tenant
- [ ] Dados cadastrais da empresa
- [ ] Logotipo (upload para R2)
- [ ] Configurações de sistema (moeda, timezone, formato de data)

### 8.2 Gerenciamento de Usuários e Permissões
- [ ] Tela de usuários completa
- [ ] Controle de roles por módulo (RBAC granular)
- [ ] Convite de novos usuários por e-mail
- [ ] Histórico de acessos

### 8.3 Planos SaaS
- [ ] Lógica de planos: free, starter, professional, enterprise
- [ ] Limites por plano (número de usuários, transações, storage)
- [ ] Tela de assinatura e upgrade

**Entregável:** Sistema multi-tenant configurável por empresa

---

## ETAPA 9 — Produção e Deploy
**Dependência: Todas as etapas anteriores**

### 9.1 Infraestrutura de Produção
- [ ] Domínio próprio configurado no Cloudflare
- [ ] Workers + Pages em produção
- [ ] Variáveis de ambiente separadas (dev/prod)
- [ ] Migrations aplicadas no banco de produção

### 9.2 CI/CD
- [ ] GitHub Actions para deploy automático do backend (Workers)
- [ ] GitHub Actions para deploy automático do frontend (Pages)
- [ ] Testes obrigatórios antes do deploy
- [ ] Preview deploys para Pull Requests

### 9.3 Monitoramento
- [ ] Cloudflare Analytics Engine integrado
- [ ] Alertas de erro por e-mail/WhatsApp
- [ ] Dashboard de saúde do sistema

### 9.4 Segurança Final
- [ ] Rate limiting por IP e por tenant
- [ ] Auditoria de todas as ações críticas
- [ ] Backup automático do D1
- [ ] Revisão de segurança (OWASP Top 10)

**Entregável:** Sistema em produção, estável e monitorado

---

## 📅 Sequência de Execução

```
SEMANA 1-2:   ETAPA 0 (Base) → sistema funcionando localmente
SEMANA 3-4:   ETAPA 1 (Cadastros) + ETAPA 2 (Produtos)
SEMANA 5-6:   ETAPA 3 (Comercial completo)
SEMANA 7:     ETAPA 4 (Dashboard real)
SEMANA 8-9:   ETAPA 5 (Financeiro)
SEMANA 10:    ETAPA 6 (Estoque)
SEMANA 11-12: ETAPA 7 (Fiscal/NF-e)
SEMANA 13:    ETAPA 8 (Configurações)
SEMANA 14:    ETAPA 9 (Produção)
```

---

## 🚦 Regras de Trabalho

1. **Nenhuma etapa começa sem a anterior estar testada**
2. **Toda alteração de banco exige migration — nunca editar tabela diretamente**
3. **Todo CRUD deve ter: list, create, getById, update, delete**
4. **Frontend nunca com dados hardcoded após Etapa 0**
5. **Não alterar código sem autorização explícita do Rodrigo**
6. **Documentar decisões no TRAILSYSTEM_MASTER.md ao final de cada etapa**

---

## ✅ Próxima Ação Imediata

Seguir o plano de organização em docs/PLANO_PROFISSIONAL.md e aplicar os padrões visuais em docs/DESIGN_GUIDELINES.md.

**Começar pela ETAPA 0.1 — Migrations**

Comando a executar no backend:
```powershell
cd "C:\Users\WINDOWS GAMER\Desktop\Code1\erp-backend"
pnpm db:generate
```
Isso vai gerar a migration com as 12 tabelas que faltam.
Depois aplicar com:
```powershell
pnpm db:migrate
```

Aguardando autorização de Rodrigo para iniciar.



