import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { tenants } from '../../tenant/infrastructure/schema';
import { users } from '../../auth/infrastructure/schema';

// ==================== Clients ====================
export const clients = sqliteTable('clients', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  code: text('code').notNull(),
  name: text('name').notNull(),
  tradeName: text('trade_name'),
  type: text('type', { enum: ['pf', 'pj'] }).notNull(),
  document: text('document').notNull(),
  rg: text('rg'),
  stateRegistration: text('state_registration'),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  cellphone: text('cellphone'),
  zipCode: text('zip_code'),
  address: text('address'),
  number: text('number'),
  complement: text('complement'),
  neighborhood: text('neighborhood'),
  city: text('city').notNull(),
  state: text('state').notNull(),
  status: text('status', { enum: ['active', 'inactive', 'blocked'] })
    .notNull()
    .default('active'),
  creditLimit: real('credit_limit').notNull().default(0),
  balance: real('balance').notNull().default(0),
  lastPurchase: text('last_purchase'),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

// ==================== Suppliers ====================
export const suppliers = sqliteTable('suppliers', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  code: text('code').notNull(),
  name: text('name').notNull(),
  tradeName: text('trade_name'),
  type: text('type', { enum: ['pf', 'pj'] }).notNull(),
  document: text('document').notNull(),
  stateRegistration: text('state_registration'),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  cellphone: text('cellphone'),
  zipCode: text('zip_code'),
  address: text('address'),
  number: text('number'),
  complement: text('complement'),
  neighborhood: text('neighborhood'),
  city: text('city').notNull(),
  state: text('state').notNull(),
  status: text('status', { enum: ['active', 'inactive', 'blocked'] })
    .notNull()
    .default('active'),
  paymentTerms: text('payment_terms'),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

// ==================== Partners ====================
export const partners = sqliteTable('partners', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  code: text('code').notNull(),
  name: text('name').notNull(),
  tradeName: text('trade_name'),
  type: text('type', { enum: ['pf', 'pj'] }).notNull(),
  document: text('document').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  cellphone: text('cellphone'),
  city: text('city').notNull(),
  state: text('state').notNull(),
  status: text('status', { enum: ['active', 'inactive', 'blocked'] })
    .notNull()
    .default('active'),
  commissionRate: real('commission_rate'),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

// ==================== Employees ====================
export const employees = sqliteTable('employees', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .references(() => users.id, { onDelete: 'set null' }),
  code: text('code').notNull(),
  name: text('name').notNull(),
  document: text('document').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  department: text('department'),
  position: text('position'),
  hireDate: text('hire_date'),
  status: text('status', { enum: ['active', 'inactive', 'blocked'] })
    .notNull()
    .default('active'),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});
