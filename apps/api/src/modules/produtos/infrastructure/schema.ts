import { pgTable, uuid, varchar, text, timestamp, numeric, integer } from 'drizzle-orm/pg-core';
import { tenants } from '../../tenant/infrastructure/schema';

// ==================== Categories ====================
export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  parentId: uuid('parent_id'),
  status: text('status', { enum: ['active', 'inactive', 'blocked'] })
    .notNull()
    .default('active'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ==================== Products ====================
export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  code: varchar('code', { length: 50 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  categoryId: uuid('category_id')
    .references(() => categories.id, { onDelete: 'set null' }),
  sku: varchar('sku', { length: 50 }),
  barcode: varchar('barcode', { length: 50 }),
  unit: varchar('unit', { length: 10 }).notNull().default('UN'),
  costPrice: numeric('cost_price', { precision: 12, scale: 2 }).notNull().default('0'),
  salePrice: numeric('sale_price', { precision: 12, scale: 2 }).notNull().default('0'),
  status: text('status', { enum: ['active', 'inactive', 'blocked'] })
    .notNull()
    .default('active'),
  minStock: integer('min_stock').notNull().default(0),
  currentStock: integer('current_stock').notNull().default(0),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
