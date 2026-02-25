import { pgTable, uuid, varchar, text, timestamp, numeric, boolean, integer } from 'drizzle-orm/pg-core';
import { tenants } from '../../tenant/infrastructure/schema';
import { products } from '../../produtos/infrastructure/schema';

// ==================== Warehouses (Depósitos) ====================
export const warehouses = pgTable('warehouses', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  code: varchar('code', { length: 20 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  type: text('type', { enum: ['main', 'branch', 'transit', 'third_party'] })
    .notNull()
    .default('main'),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 2 }),
  responsible: varchar('responsible', { length: 100 }),
  isActive: boolean('is_active').notNull().default(true),
  isDefault: boolean('is_default').notNull().default(false),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ==================== Stock Levels (Saldos por produto/depósito) ====================
export const stockLevels = pgTable('stock_levels', {
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
  quantity: numeric('quantity', { precision: 15, scale: 4 }).notNull().default('0'),
  reservedQuantity: numeric('reserved_quantity', { precision: 15, scale: 4 }).notNull().default('0'),
  availableQuantity: numeric('available_quantity', { precision: 15, scale: 4 }).notNull().default('0'),
  averageCost: numeric('average_cost', { precision: 12, scale: 2 }).notNull().default('0'),
  lastMovementAt: timestamp('last_movement_at', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ==================== Stock Movements (Movimentações — IMUTÁVEIS) ====================
export const stockMovements = pgTable('stock_movements', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  warehouseId: uuid('warehouse_id')
    .notNull()
    .references(() => warehouses.id),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id),
  type: text('type', { enum: [
    'purchase_entry', 'sale_exit', 'transfer_in', 'transfer_out',
    'adjustment_in', 'adjustment_out', 'return_in', 'return_out', 'production',
  ] }).notNull(),
  quantity: numeric('quantity', { precision: 15, scale: 4 }).notNull(),
  unitCost: numeric('unit_cost', { precision: 12, scale: 2 }).notNull().default('0'),
  totalCost: numeric('total_cost', { precision: 12, scale: 2 }).notNull().default('0'),
  previousQuantity: numeric('previous_quantity', { precision: 15, scale: 4 }).notNull().default('0'),
  newQuantity: numeric('new_quantity', { precision: 15, scale: 4 }).notNull().default('0'),
  previousAverageCost: numeric('previous_average_cost', { precision: 12, scale: 2 }).notNull().default('0'),
  newAverageCost: numeric('new_average_cost', { precision: 12, scale: 2 }).notNull().default('0'),
  referenceType: varchar('reference_type', { length: 30 }),
  referenceId: uuid('reference_id'),
  referenceNumber: varchar('reference_number', { length: 50 }),
  reason: text('reason'),
  userId: uuid('user_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ==================== Stock Transfers (Transferências entre depósitos) ====================
export const stockTransfers = pgTable('stock_transfers', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  number: varchar('number', { length: 30 }).notNull(),
  fromWarehouseId: uuid('from_warehouse_id')
    .notNull()
    .references(() => warehouses.id),
  toWarehouseId: uuid('to_warehouse_id')
    .notNull()
    .references(() => warehouses.id),
  status: text('status', { enum: ['draft', 'in_transit', 'received', 'cancelled'] })
    .notNull()
    .default('draft'),
  notes: text('notes'),
  userId: uuid('user_id').notNull(),
  shippedAt: timestamp('shipped_at', { withTimezone: true }),
  receivedAt: timestamp('received_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ==================== Stock Transfer Items ====================
export const stockTransferItems = pgTable('stock_transfer_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  transferId: uuid('transfer_id')
    .notNull()
    .references(() => stockTransfers.id, { onDelete: 'cascade' }),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id),
  quantity: numeric('quantity', { precision: 15, scale: 4 }).notNull(),
  unitCost: numeric('unit_cost', { precision: 12, scale: 2 }).notNull().default('0'),
});

// ==================== Inventory Counts (Contagens de inventário) ====================
export const inventoryCounts = pgTable('inventory_counts', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  number: varchar('number', { length: 30 }).notNull(),
  warehouseId: uuid('warehouse_id')
    .notNull()
    .references(() => warehouses.id),
  status: text('status', { enum: ['draft', 'counting', 'review', 'approved', 'cancelled'] })
    .notNull()
    .default('draft'),
  type: text('type', { enum: ['full', 'partial', 'cyclic'] })
    .notNull()
    .default('full'),
  blindCount: boolean('blind_count').notNull().default(true),
  notes: text('notes'),
  userId: uuid('user_id').notNull(),
  approvedBy: uuid('approved_by'),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ==================== Inventory Count Items ====================
export const inventoryCountItems = pgTable('inventory_count_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  countId: uuid('count_id')
    .notNull()
    .references(() => inventoryCounts.id, { onDelete: 'cascade' }),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id),
  systemQuantity: numeric('system_quantity', { precision: 15, scale: 4 }).notNull().default('0'),
  countedQuantity: numeric('counted_quantity', { precision: 15, scale: 4 }),
  difference: numeric('difference', { precision: 15, scale: 4 }),
  status: text('status', { enum: ['pending', 'counted', 'adjusted'] })
    .notNull()
    .default('pending'),
  notes: text('notes'),
  countedBy: uuid('counted_by'),
  countedAt: timestamp('counted_at', { withTimezone: true }),
});

// ==================== Stock Settings (Configurações do módulo) ====================
export const stockSettings = pgTable('stock_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  defaultWarehouseId: uuid('default_warehouse_id')
    .references(() => warehouses.id),
  costMethod: text('cost_method', { enum: ['average', 'fifo', 'lifo'] })
    .notNull()
    .default('average'),
  allowNegativeStock: boolean('allow_negative_stock').notNull().default(false),
  autoGenerateMovements: boolean('auto_generate_movements').notNull().default(true),
  lowStockAlertEnabled: boolean('low_stock_alert_enabled').notNull().default(true),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
