import { pgTable, uuid, varchar, text, timestamp, numeric, integer } from 'drizzle-orm/pg-core';
import { tenants } from '../../tenant/infrastructure/schema';
import { clients } from '../../cadastros/infrastructure/schema';
import { employees } from '../../cadastros/infrastructure/schema';
import { products } from '../../produtos/infrastructure/schema';

// ==================== Quotes (Orçamentos) ====================
export const quotes = pgTable('quotes', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  number: varchar('number', { length: 50 }).notNull(),
  clientId: uuid('client_id')
    .notNull()
    .references(() => clients.id),
  sellerId: uuid('seller_id')
    .references(() => employees.id),
  date: timestamp('date', { withTimezone: true }).notNull(),
  validUntil: timestamp('valid_until', { withTimezone: true }),
  status: text('status', { enum: ['draft', 'sent', 'approved', 'rejected', 'expired'] })
    .notNull()
    .default('draft'),
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull().default('0'),
  discount: numeric('discount', { precision: 12, scale: 2 }).notNull().default('0'),
  total: numeric('total', { precision: 12, scale: 2 }).notNull().default('0'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ==================== Quote Items ====================
export const quoteItems = pgTable('quote_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  quoteId: uuid('quote_id')
    .notNull()
    .references(() => quotes.id, { onDelete: 'cascade' }),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id),
  quantity: integer('quantity').notNull(),
  unitPrice: numeric('unit_price', { precision: 12, scale: 2 }).notNull(),
  discount: numeric('discount', { precision: 12, scale: 2 }).notNull().default('0'),
  total: numeric('total', { precision: 12, scale: 2 }).notNull(),
  notes: text('notes'),
});

// ==================== Sales (Vendas) ====================
export const sales = pgTable('sales', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  number: varchar('number', { length: 50 }).notNull(),
  quoteId: uuid('quote_id')
    .references(() => quotes.id),
  clientId: uuid('client_id')
    .notNull()
    .references(() => clients.id),
  sellerId: uuid('seller_id')
    .references(() => employees.id),
  date: timestamp('date', { withTimezone: true }).notNull(),
  status: text('status', { enum: ['pending', 'confirmed', 'invoiced', 'cancelled'] })
    .notNull()
    .default('pending'),
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull().default('0'),
  discount: numeric('discount', { precision: 12, scale: 2 }).notNull().default('0'),
  total: numeric('total', { precision: 12, scale: 2 }).notNull().default('0'),
  paymentMethod: varchar('payment_method', { length: 50 }),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ==================== Sale Items ====================
export const saleItems = pgTable('sale_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  saleId: uuid('sale_id')
    .notNull()
    .references(() => sales.id, { onDelete: 'cascade' }),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id),
  quantity: integer('quantity').notNull(),
  unitPrice: numeric('unit_price', { precision: 12, scale: 2 }).notNull(),
  discount: numeric('discount', { precision: 12, scale: 2 }).notNull().default('0'),
  total: numeric('total', { precision: 12, scale: 2 }).notNull(),
});

// ==================== Returns (Devoluções) ====================
export const returns = pgTable('returns', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  number: varchar('number', { length: 50 }).notNull(),
  saleId: uuid('sale_id')
    .notNull()
    .references(() => sales.id),
  clientId: uuid('client_id')
    .notNull()
    .references(() => clients.id),
  date: timestamp('date', { withTimezone: true }).notNull(),
  status: text('status', { enum: ['pending', 'approved', 'rejected', 'completed'] })
    .notNull()
    .default('pending'),
  reason: text('reason'),
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull().default('0'),
  total: numeric('total', { precision: 12, scale: 2 }).notNull().default('0'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ==================== Return Items ====================
export const returnItems = pgTable('return_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  returnId: uuid('return_id')
    .notNull()
    .references(() => returns.id, { onDelete: 'cascade' }),
  saleItemId: uuid('sale_item_id')
    .references(() => saleItems.id),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id),
  quantity: integer('quantity').notNull(),
  unitPrice: numeric('unit_price', { precision: 12, scale: 2 }).notNull(),
  total: numeric('total', { precision: 12, scale: 2 }).notNull(),
  reason: text('reason'),
});
