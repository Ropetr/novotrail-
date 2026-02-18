import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { tenants } from '../../tenant/infrastructure/schema';
import { clients } from '../../cadastros/infrastructure/schema';
import { employees } from '../../cadastros/infrastructure/schema';
import { products } from '../../produtos/infrastructure/schema';

// ==================== Quotes (Orçamentos) ====================
export const quotes = sqliteTable('quotes', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  number: text('number').notNull(),
  clientId: text('client_id')
    .notNull()
    .references(() => clients.id),
  sellerId: text('seller_id')
    .references(() => employees.id),
  date: text('date').notNull(),
  validUntil: text('valid_until'),
  status: text('status', { enum: ['draft', 'sent', 'approved', 'rejected', 'expired'] })
    .notNull()
    .default('draft'),
  subtotal: real('subtotal').notNull().default(0),
  discount: real('discount').notNull().default(0),
  total: real('total').notNull().default(0),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

// ==================== Quote Items ====================
export const quoteItems = sqliteTable('quote_items', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  quoteId: text('quote_id')
    .notNull()
    .references(() => quotes.id, { onDelete: 'cascade' }),
  productId: text('product_id')
    .notNull()
    .references(() => products.id),
  quantity: integer('quantity').notNull(),
  unitPrice: real('unit_price').notNull(),
  discount: real('discount').notNull().default(0),
  total: real('total').notNull(),
  notes: text('notes'),
});

// ==================== Sales (Vendas) ====================
export const sales = sqliteTable('sales', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  number: text('number').notNull(),
  quoteId: text('quote_id')
    .references(() => quotes.id),
  clientId: text('client_id')
    .notNull()
    .references(() => clients.id),
  sellerId: text('seller_id')
    .references(() => employees.id),
  date: text('date').notNull(),
  status: text('status', { enum: ['pending', 'confirmed', 'invoiced', 'cancelled'] })
    .notNull()
    .default('pending'),
  subtotal: real('subtotal').notNull().default(0),
  discount: real('discount').notNull().default(0),
  total: real('total').notNull().default(0),
  paymentMethod: text('payment_method'),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

// ==================== Sale Items ====================
export const saleItems = sqliteTable('sale_items', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  saleId: text('sale_id')
    .notNull()
    .references(() => sales.id, { onDelete: 'cascade' }),
  productId: text('product_id')
    .notNull()
    .references(() => products.id),
  quantity: integer('quantity').notNull(),
  unitPrice: real('unit_price').notNull(),
  discount: real('discount').notNull().default(0),
  total: real('total').notNull(),
});

// ==================== Returns (Devoluções) ====================
export const returns = sqliteTable('returns', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  number: text('number').notNull(),
  saleId: text('sale_id')
    .notNull()
    .references(() => sales.id),
  clientId: text('client_id')
    .notNull()
    .references(() => clients.id),
  date: text('date').notNull(),
  status: text('status', { enum: ['pending', 'approved', 'rejected', 'completed'] })
    .notNull()
    .default('pending'),
  reason: text('reason'),
  subtotal: real('subtotal').notNull().default(0),
  total: real('total').notNull().default(0),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

// ==================== Return Items ====================
export const returnItems = sqliteTable('return_items', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  returnId: text('return_id')
    .notNull()
    .references(() => returns.id, { onDelete: 'cascade' }),
  saleItemId: text('sale_item_id')
    .references(() => saleItems.id),
  productId: text('product_id')
    .notNull()
    .references(() => products.id),
  quantity: integer('quantity').notNull(),
  unitPrice: real('unit_price').notNull(),
  total: real('total').notNull(),
  reason: text('reason'),
});
