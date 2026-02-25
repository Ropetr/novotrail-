import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  numeric,
  integer,
  boolean,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { tenants } from '../../tenant/infrastructure/schema';
import { products } from '../../produtos/infrastructure/schema';

// ==================== Warehouses (Depósitos) ====================
export const warehouses = pgTable('warehouses', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 200 }).notNull(),
  code: varchar('code', { length: 50 }).notNull(),
  type: text('type', { enum: ['main', 'branch', 'transit', 'defective'] })
    .notNull()
    .default('main'),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 2 }),
  zipCode: varchar('zip_code', { length: 10 }),
  isActive: boolean('is_active').notNull().default(true),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ==================== Stock Levels (Saldos) ====================
export const stockLevels = pgTable(
  'stock_levels',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id),
    warehouseId: uuid('warehouse_id')
      .notNull()
      .references(() => warehouses.id),
    quantity: numeric('quantity', { precision: 12, scale: 4 }).notNull().default('0'),
    reservedQty: numeric('reserved_qty', { precision: 12, scale: 4 }).notNull().default('0'),
    averageCost: numeric('average_cost', { precision: 12, scale: 4 }).notNull().default('0'),
    lastPurchaseCost: numeric('last_purchase_cost', { precision: 12, scale: 4 }),
    minStock: numeric('min_stock', { precision: 12, scale: 4 }).default('0'),
    maxStock: numeric('max_stock', { precision: 12, scale: 4 }),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    uniqueProductWarehouse: uniqueIndex('uq_stock_levels_tenant_product_warehouse').on(
      table.tenantId,
      table.productId,
      table.warehouseId
    ),
  })
);

// ==================== Stock Movements (Movimentações) ====================
export const stockMovements = pgTable('stock_movements', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id),
  warehouseId: uuid('warehouse_id')
    .notNull()
    .references(() => warehouses.id),
  type: text('type', {
    enum: [
      'purchase_in',
      'sale_out',
      'return_in',
      'transfer_in',
      'transfer_out',
      'adjustment',
      'damage',
      'loss',
      'bonus_out',
    ],
  }).notNull(),
  quantity: numeric('quantity', { precision: 12, scale: 4 }).notNull(),
  unitCost: numeric('unit_cost', { precision: 12, scale: 4 }),
  totalCost: numeric('total_cost', { precision: 12, scale: 4 }),
  referenceType: varchar('reference_type', { length: 50 }),
  referenceId: uuid('reference_id'),
  batchId: uuid('batch_id'),
  reason: text('reason'),
  notes: text('notes'),
  createdBy: uuid('created_by'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ==================== Product Batches (Lotes) ====================
export const productBatches = pgTable('product_batches', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id),
  warehouseId: uuid('warehouse_id')
    .notNull()
    .references(() => warehouses.id),
  batchNumber: varchar('batch_number', { length: 100 }).notNull(),
  quantity: numeric('quantity', { precision: 12, scale: 4 }).notNull().default('0'),
  unitCost: numeric('unit_cost', { precision: 12, scale: 4 }),
  expirationDate: timestamp('expiration_date', { withTimezone: true }),
  manufacturingDate: timestamp('manufacturing_date', { withTimezone: true }),
  status: text('status', { enum: ['active', 'expired', 'consumed', 'quarantine'] })
    .notNull()
    .default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ==================== Inventory Counts (Inventários) ====================
export const inventoryCounts = pgTable('inventory_counts', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  warehouseId: uuid('warehouse_id')
    .notNull()
    .references(() => warehouses.id),
  number: varchar('number', { length: 50 }).notNull(),
  status: text('status', { enum: ['draft', 'counting', 'review', 'approved', 'cancelled'] })
    .notNull()
    .default('draft'),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  approvedBy: uuid('approved_by'),
  notes: text('notes'),
  createdBy: uuid('created_by'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ==================== Inventory Count Items ====================
export const inventoryCountItems = pgTable('inventory_count_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  inventoryCountId: uuid('inventory_count_id')
    .notNull()
    .references(() => inventoryCounts.id, { onDelete: 'cascade' }),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id),
  systemQty: numeric('system_qty', { precision: 12, scale: 4 }),
  countedQty: numeric('counted_qty', { precision: 12, scale: 4 }),
  difference: numeric('difference', { precision: 12, scale: 4 }),
  notes: text('notes'),
  countedAt: timestamp('counted_at', { withTimezone: true }),
});
