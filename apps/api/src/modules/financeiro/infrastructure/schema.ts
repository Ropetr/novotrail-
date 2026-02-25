import { pgTable, uuid, text, numeric, timestamp, boolean, varchar, index, date } from 'drizzle-orm/pg-core';
import { tenants } from '../../tenant/infrastructure/schema';
import { users } from '../../auth/infrastructure/schema';

// ==================== Plano de Contas ====================

export const chartOfAccounts = pgTable('chart_of_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  code: varchar('code', { length: 20 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  type: varchar('type', { length: 20 }).notNull(), // asset, liability, equity, revenue, expense
  parentId: uuid('parent_id'),
  isAnalytical: boolean('is_analytical').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ==================== Contas Bancárias ====================

export const bankAccounts = pgTable('bank_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  bankCode: varchar('bank_code', { length: 10 }).notNull(),
  agency: varchar('agency', { length: 20 }).notNull(),
  accountNumber: varchar('account_number', { length: 20 }).notNull(),
  accountType: varchar('account_type', { length: 20 }).notNull(), // checking, savings, cash
  description: varchar('description', { length: 100 }),
  initialBalance: numeric('initial_balance', { precision: 15, scale: 2 }).default('0'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ==================== Centros de Custo ====================

export const costCenters = pgTable('cost_centers', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  code: varchar('code', { length: 20 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  parentId: uuid('parent_id'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ==================== Títulos (Contas a Pagar/Receber) ====================

export const financialTitles = pgTable('financial_titles', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 10 }).notNull(), // payable, receivable
  origin: varchar('origin', { length: 20 }).notNull(), // purchase, sale, manual, adjustment
  originId: uuid('origin_id'),
  documentNumber: varchar('document_number', { length: 50 }),
  description: varchar('description', { length: 200 }),
  personId: uuid('person_id').notNull(), // cliente ou fornecedor
  dueDate: date('due_date').notNull(),
  issueDate: date('issue_date').notNull(),
  value: numeric('value', { precision: 15, scale: 2 }).notNull(),
  openValue: numeric('open_value', { precision: 15, scale: 2 }).notNull(),
  discount: numeric('discount', { precision: 15, scale: 2 }).default('0'),
  interest: numeric('interest', { precision: 15, scale: 2 }).default('0'),
  fine: numeric('fine', { precision: 15, scale: 2 }).default('0'),
  status: varchar('status', { length: 20 }).default('open'), // open, paid, partial, canceled, overdue
  costCenterId: uuid('cost_center_id'),
  accountId: uuid('account_id'),
  bankAccountId: uuid('bank_account_id'),
  attachmentUrl: text('attachment_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  tenantIdx: index('financial_titles_tenant_idx').on(table.tenantId),
  personIdx: index('financial_titles_person_idx').on(table.personId),
  dueIdx: index('financial_titles_due_idx').on(table.dueDate),
  statusIdx: index('financial_titles_status_idx').on(table.status),
}));

// ==================== Baixas/Liquidações ====================

export const financialSettlements = pgTable('financial_settlements', {
  id: uuid('id').primaryKey().defaultRandom(),
  titleId: uuid('title_id').notNull().references(() => financialTitles.id),
  settlementDate: date('settlement_date').notNull(),
  value: numeric('value', { precision: 15, scale: 2 }).notNull(),
  discount: numeric('discount', { precision: 15, scale: 2 }).default('0'),
  interest: numeric('interest', { precision: 15, scale: 2 }).default('0'),
  fine: numeric('fine', { precision: 15, scale: 2 }).default('0'),
  bankAccountId: uuid('bank_account_id'),
  attachmentUrl: text('attachment_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ==================== Movimentação Financeira ====================

export const financialTransactions = pgTable('financial_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  bankAccountId: uuid('bank_account_id').notNull().references(() => bankAccounts.id),
  type: varchar('type', { length: 20 }).notNull(), // inflow, outflow, transfer_in, transfer_out, adjustment
  value: numeric('value', { precision: 15, scale: 2 }).notNull(),
  description: varchar('description', { length: 200 }),
  referenceId: uuid('reference_id'),
  referenceType: varchar('reference_type', { length: 20 }),
  occurredAt: timestamp('occurred_at', { withTimezone: true }).defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ==================== Logs/Auditoria ====================

export const financialLogs = pgTable('financial_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  entity: varchar('entity', { length: 50 }).notNull(),
  entityId: uuid('entity_id').notNull(),
  action: varchar('action', { length: 20 }).notNull(), // create, update, delete, settle, cancel
  userId: uuid('user_id').notNull().references(() => users.id),
  details: text('details'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
