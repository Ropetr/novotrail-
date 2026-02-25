# ESPECIFICAÇÃO TÉCNICA DEFINITIVA – MÓDULO FINANCEIRO (NOVO)

**Projeto:** NovoTrail ERP  
**Stack:** Cloudflare Workers + Hono + Drizzle ORM + Neon PostgreSQL + React 18  
**Arquitetura:** Clean Architecture (domain, application, infrastructure, presentation)  
**Multi-tenant:** `tenantId` em todas as tabelas  
**IDs:** UUID  
**Valores:** `numeric(15,2)` para dinheiro, `numeric(15,4)` para quantidade  
**Timestamps:** sempre com timezone  
**Cliente:** PLANAC (materiais de construção)

---

## 1. CONTEXTO

O módulo Financeiro é crítico para fechar o ciclo operacional do ERP, integrando-se com Fiscal (contas a pagar) e Comercial (contas a receber). Ele será criado do zero, com base no benchmarking de 6 ERPs brasileiros e nas melhores práticas de mercado.

---

## 2. FUNCIONALIDADES (DIFERENCIAIS)

- **Plano de contas flexível** (contábil e gerencial)
- **Contas a pagar/receber**: integração automática com Fiscal e Comercial
- **Movimentação financeira**: entradas, saídas, transferências, conciliação bancária
- **Fluxo de caixa**: previsto x realizado, multi-conta
- **Centro de custo/projeto**
- **Integração bancária**: CNAB, extrato OFX, conciliação automática
- **Baixa parcial, desconto, juros, multa**
- **Anexos (comprovantes, boletos, NF)**
- **Auditoria e logs**
- **Relatórios avançados**: aging, inadimplência, DRE gerencial

---

## 3. SCHEMAS DRIZZLE (completo, copy-paste ready)

```typescript
// Imports padrão
import { pgTable, uuid, text, numeric, timestamp, boolean, integer, varchar, index, date } from "drizzle-orm/pg-core";
import { tenants } from "../../tenant/infrastructure/schema";
import { users } from "../../auth/infrastructure/schema";

// Plano de Contas
export const chartOfAccounts = pgTable("chart_of_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  code: varchar("code", { length: 20 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // asset, liability, equity, revenue, expense
  parentId: uuid("parent_id").references(() => chartOfAccounts.id),
  isAnalytical: boolean("is_analytical").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Bancos/Contas Correntes
export const bankAccounts = pgTable("bank_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  bankCode: varchar("bank_code", { length: 10 }).notNull(),
  agency: varchar("agency", { length: 20 }).notNull(),
  accountNumber: varchar("account_number", { length: 20 }).notNull(),
  accountType: varchar("account_type", { length: 20 }).notNull(), // checking, savings, cash
  description: varchar("description", { length: 100 }),
  initialBalance: numeric("initial_balance", { precision: 15, scale: 2 }).default("0"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Centros de Custo
export const costCenters = pgTable("cost_centers", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  code: varchar("code", { length: 20 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  parentId: uuid("parent_id").references(() => costCenters.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Contas a Pagar/Receber
export const financialTitles = pgTable("financial_titles", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 10 }).notNull(), // payable, receivable
  origin: varchar("origin", { length: 20 }).notNull(), // purchase, sale, manual, adjustment
  originId: uuid("origin_id"), // id da venda, compra, etc
  documentNumber: varchar("document_number", { length: 50 }),
  description: varchar("description", { length: 200 }),
  personId: uuid("person_id").notNull(), // cliente ou fornecedor
  dueDate: date("due_date").notNull(),
  issueDate: date("issue_date").notNull(),
  value: numeric("value", { precision: 15, scale: 2 }).notNull(),
  openValue: numeric("open_value", { precision: 15, scale: 2 }).notNull(),
  discount: numeric("discount", { precision: 15, scale: 2 }).default("0"),
  interest: numeric("interest", { precision: 15, scale: 2 }).default("0"),
  fine: numeric("fine", { precision: 15, scale: 2 }).default("0"),
  status: varchar("status", { length: 20 }).default("open"), // open, paid, partial, canceled, overdue
  costCenterId: uuid("cost_center_id").references(() => costCenters.id),
  accountId: uuid("account_id").references(() => chartOfAccounts.id),
  bankAccountId: uuid("bank_account_id").references(() => bankAccounts.id),
  attachmentUrl: text("attachment_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  tenantIdx: index("financial_titles_tenant_idx").on(table.tenantId),
  personIdx: index("financial_titles_person_idx").on(table.personId),
  dueIdx: index("financial_titles_due_idx").on(table.dueDate),
  statusIdx: index("financial_titles_status_idx").on(table.status),
}));

// Baixas (liquidações)
export const financialSettlements = pgTable("financial_settlements", {
  id: uuid("id").primaryKey().defaultRandom(),
  titleId: uuid("title_id").notNull().references(() => financialTitles.id),
  settlementDate: date("settlement_date").notNull(),
  value: numeric("value", { precision: 15, scale: 2 }).notNull(),
  discount: numeric("discount", { precision: 15, scale: 2 }).default("0"),
  interest: numeric("interest", { precision: 15, scale: 2 }).default("0"),
  fine: numeric("fine", { precision: 15, scale: 2 }).default("0"),
  bankAccountId: uuid("bank_account_id").references(() => bankAccounts.id),
  attachmentUrl: text("attachment_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Movimentação Financeira (extrato)
export const financialTransactions = pgTable("financial_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  bankAccountId: uuid("bank_account_id").notNull().references(() => bankAccounts.id),
  type: varchar("type", { length: 20 }).notNull(), // inflow, outflow, transfer_in, transfer_out, adjustment
  value: numeric("value", { precision: 15, scale: 2 }).notNull(),
  description: varchar("description", { length: 200 }),
  referenceId: uuid("reference_id"), // id do título, liquidação, etc
  referenceType: varchar("reference_type", { length: 20 }),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Conciliação Bancária
export const bankReconciliations = pgTable("bank_reconciliations", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  bankAccountId: uuid("bank_account_id").notNull().references(() => bankAccounts.id),
  statementDate: date("statement_date").notNull(),
  statementBalance: numeric("statement_balance", { precision: 15, scale: 2 }).notNull(),
  reconciled: boolean("reconciled").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Logs/Auditoria
export const financialLogs = pgTable("financial_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  entity: varchar("entity", { length: 50 }).notNull(),
  entityId: uuid("entity_id").notNull(),
  action: varchar("action", { length: 20 }).notNull(), // create, update, delete, settle, cancel
  userId: uuid("user_id").notNull().references(() => users.id),
  details: text("details"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
```

---

## 4. ENDPOINTS (RESTful)

#### PLANO DE CONTAS
- `GET    /chart-of-accounts`
- `POST   /chart-of-accounts`
- `PUT    /chart-of-accounts/:id`
- `DELETE /chart-of-accounts/:id`

#### CONTAS CORRENTES
- `GET    /bank-accounts`
- `POST   /bank-accounts`
- `PUT    /bank-accounts/:id`
- `DELETE /bank-accounts/:id`

#### CENTROS DE CUSTO
- `GET    /cost-centers`
- `POST   /cost-centers`
- `PUT    /cost-centers/:id`
- `DELETE /cost-centers/:id`

#### CONTAS A PAGAR/RECEBER
- `GET    /financial-titles`
- `POST   /financial-titles`
- `PUT    /financial-titles/:id`
- `DELETE /financial-titles/:id`
- `POST   /financial-titles/:id/settle` – baixa/liquidação

#### MOVIMENTAÇÃO FINANCEIRA
- `GET    /financial-transactions`
- `POST   /financial-transactions`

#### CONCILIAÇÃO BANCÁRIA
- `GET    /bank-reconciliations`
- `POST   /bank-reconciliations`
- `POST   /bank-reconciliations/:id/match` – conciliar lançamentos

#### RELATÓRIOS
- `GET    /financial-reports/cashflow`
- `GET    /financial-reports/aging`
- `GET    /financial-reports/dre`

#### LOGS/AUDITORIA
- `GET    /financial-logs`

---

## 5. REGRAS DE NEGÓCIO

- **Integração Fiscal/Comercial**:  
  - Entrada de NF-e (DF-e Inbox) gera título a pagar e movimentação de estoque.
  - Venda faturada gera título a receber e saída de estoque.
- **Baixa parcial**: Título pode ser liquidado em múltiplas parcelas.
- **Desconto, juros, multa**: Calculados automaticamente na baixa.
- **Conciliação automática**: Importação de extrato (OFX/CNAB), matching automático/manual.
- **Auditoria**: Toda alteração relevante gera log.
- **Fluxo de caixa**: Previsto (títulos) x realizado (transações).
- **Centro de custo/projeto**: Obrigatório para títulos.
- **Anexos**: Upload de comprovantes, boletos, NF.
- **Permissões**: Controle de acesso por perfil/usuário.

---

## 6. TELAS (FRONTEND)

- **Dashboard Financeiro**: KPIs, fluxo de caixa, alertas de vencimento
- **Plano de Contas**: Árvore, CRUD, importação/exportação
- **Contas Correntes**: Saldos, extrato, conciliação
- **Contas a Pagar/Receber**: Listagem, filtros, baixa parcial, anexos, integração com vendas/compras
- **Movimentação Financeira**: Lançamentos manuais, transferências, ajustes
- **Conciliação Bancária**: Importação de extrato, matching, ajustes
- **Relatórios**: Aging, inadimplência, DRE, fluxo de caixa
- **Logs/Auditoria**: Timeline de alterações, filtros por usuário/ação

---

## 7. INTEGRAÇÃO ENTRE MÓDULOS (EVENTOS DE DOMÍNIO)

- **Ao registrar NF-e de entrada**:  
  - Evento `GoodsReceived` → cria movimentação de estoque (entrada) + título a pagar (financeiro)
- **Ao faturar venda**:  
  - Evento `SaleInvoiced` → cria movimentação de estoque (saída) + título a receber (financeiro)
- **Orquestração**:  
  - Fila de eventos (ex: Redis, Pub/Sub) para garantir atomicidade e reprocessamento em caso de falha

---

## 8. TODOs

- [ ] Implementar os schemas no banco de dados
- [ ] Criar os endpoints na API
- [ ] Desenvolver as telas no frontend
- [ ] Implementar as regras de negócio e integrações
- [ ] Criar testes automatizados para as novas funcionalidades
