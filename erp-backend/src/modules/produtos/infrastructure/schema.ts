import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { tenants } from '../../tenant/infrastructure/schema';

// ==================== Categories ====================
export const categories = sqliteTable('categories', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  parentId: text('parent_id'),
  status: text('status', { enum: ['active', 'inactive', 'blocked'] })
    .notNull()
    .default('active'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

// ==================== Products ====================
export const products = sqliteTable('products', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: text('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  code: text('code').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  categoryId: text('category_id')
    .references(() => categories.id, { onDelete: 'set null' }),
  sku: text('sku'),
  barcode: text('barcode'),
  unit: text('unit').notNull().default('UN'),
  costPrice: real('cost_price').notNull().default(0),
  salePrice: real('sale_price').notNull().default(0),
  status: text('status', { enum: ['active', 'inactive', 'blocked'] })
    .notNull()
    .default('active'),
  minStock: integer('min_stock').notNull().default(0),
  currentStock: integer('current_stock').notNull().default(0),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});
