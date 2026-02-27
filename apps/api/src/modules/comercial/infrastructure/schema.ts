import { pgTable, uuid, varchar, text, timestamp, numeric, integer, boolean } from 'drizzle-orm/pg-core';
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
  freight: numeric('freight', { precision: 12, scale: 2 }).notNull().default('0'),
  surcharge: numeric('surcharge', { precision: 12, scale: 2 }).notNull().default('0'),
  paymentTerms: text('payment_terms'),
  deliveryTerms: text('delivery_terms'),
  notes: text('notes'),
  // --- Mesclar/Desmembrar (TrailSystem COM-06 a COM-10) ---
  parentQuoteId: uuid('parent_quote_id'),
  mergedFrom: text('merged_from'),
  version: integer('version').notNull().default(1),
  internalNotes: text('internal_notes'),
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
  itemType: text('item_type', { enum: ['product', 'service'] }).notNull().default('product'),
  sequence: integer('sequence').notNull().default(1),
  quantity: integer('quantity').notNull(),
  unitPrice: numeric('unit_price', { precision: 12, scale: 2 }).notNull(),
  discount: numeric('discount', { precision: 12, scale: 2 }).notNull().default('0'),
  surcharge: numeric('surcharge', { precision: 12, scale: 2 }).notNull().default('0'),
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
  status: text('status', { enum: ['pending', 'confirmed', 'partial_invoiced', 'invoiced', 'partial_delivered', 'delivered', 'finished', 'cancelled'] })
    .notNull()
    .default('pending'),
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull().default('0'),
  discount: numeric('discount', { precision: 12, scale: 2 }).notNull().default('0'),
  total: numeric('total', { precision: 12, scale: 2 }).notNull().default('0'),
  freight: numeric('freight', { precision: 12, scale: 2 }).notNull().default('0'),
  surcharge: numeric('surcharge', { precision: 12, scale: 2 }).notNull().default('0'),
  paymentMethod: varchar('payment_method', { length: 50 }),
  notes: text('notes'),
  // --- Desmembrar (TrailSystem COM-20) ---
  parentSaleId: uuid('parent_sale_id'),
  splitFrom: text('split_from'),
  // --- Financeiro flexível (TrailSystem COM-39 a COM-44) ---
  financialType: text('financial_type', { enum: ['integral', 'parent_receivable', 'per_delivery', 'define_later'] })
    .notNull()
    .default('integral'),
  // --- Status granular (TrailSystem COM-21 a COM-26) ---
  invoicedAmount: numeric('invoiced_amount', { precision: 12, scale: 2 }).notNull().default('0'),
  deliveredAmount: numeric('delivered_amount', { precision: 12, scale: 2 }).notNull().default('0'),
  receivedAmount: numeric('received_amount', { precision: 12, scale: 2 }).notNull().default('0'),
  // --- Crédito utilizado ---
  creditUsed: numeric('credit_used', { precision: 12, scale: 2 }).notNull().default('0'),
  creditReservedForDeliveries: boolean('credit_reserved_for_deliveries').notNull().default(false),
  internalNotes: text('internal_notes'),
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
  itemType: text('item_type', { enum: ['product', 'service'] }).notNull().default('product'),
  sequence: integer('sequence').notNull().default(1),
  quantity: integer('quantity').notNull(),
  quantityInvoiced: integer('quantity_invoiced').notNull().default(0),
  quantityDelivered: integer('quantity_delivered').notNull().default(0),
  unitPrice: numeric('unit_price', { precision: 12, scale: 2 }).notNull(),
  discount: numeric('discount', { precision: 12, scale: 2 }).notNull().default('0'),
  surcharge: numeric('surcharge', { precision: 12, scale: 2 }).notNull().default('0'),
  total: numeric('total', { precision: 12, scale: 2 }).notNull(),
});

// ==================== Sale Deliveries (Entregas Fracionadas - COM-27 a COM-31) ====================
export const saleDeliveries = pgTable('sale_deliveries', {
  id: uuid('id').defaultRandom().primaryKey(),
  saleId: uuid('sale_id')
    .notNull()
    .references(() => sales.id, { onDelete: 'cascade' }),
  number: varchar('number', { length: 20 }).notNull(),
  sequence: integer('sequence').notNull(),
  status: text('status', { enum: ['pending', 'separating', 'separated', 'invoiced', 'in_transit', 'delivered', 'cancelled'] })
    .notNull()
    .default('pending'),
  deliveryType: text('delivery_type', { enum: ['pickup', 'delivery'] })
    .notNull()
    .default('delivery'),
  scheduledDate: timestamp('scheduled_date', { withTimezone: true }),
  separatedAt: timestamp('separated_at', { withTimezone: true }),
  invoicedAt: timestamp('invoiced_at', { withTimezone: true }),
  shippedAt: timestamp('shipped_at', { withTimezone: true }),
  deliveredAt: timestamp('delivered_at', { withTimezone: true }),
  receiverName: varchar('receiver_name', { length: 200 }),
  receiverDocument: varchar('receiver_document', { length: 20 }),
  driverName: varchar('driver_name', { length: 200 }),
  vehiclePlate: varchar('vehicle_plate', { length: 10 }),
  trackingCode: varchar('tracking_code', { length: 100 }),
  productAmount: numeric('product_amount', { precision: 12, scale: 2 }).notNull().default('0'),
  freightAmount: numeric('freight_amount', { precision: 12, scale: 2 }).notNull().default('0'),
  totalAmount: numeric('total_amount', { precision: 12, scale: 2 }).notNull().default('0'),
  paymentMethod: varchar('payment_method', { length: 50 }),
  creditUsed: numeric('credit_used', { precision: 12, scale: 2 }).notNull().default('0'),
  financialGenerated: boolean('financial_generated').notNull().default(false),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
    .$onUpdate(() => new Date()),
});

// ==================== Sale Delivery Items ====================
export const saleDeliveryItems = pgTable('sale_delivery_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  deliveryId: uuid('delivery_id')
    .notNull()
    .references(() => saleDeliveries.id, { onDelete: 'cascade' }),
  saleItemId: uuid('sale_item_id')
    .notNull()
    .references(() => saleItems.id),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id),
  quantity: integer('quantity').notNull(),
  quantitySeparated: integer('quantity_separated').notNull().default(0),
  quantityDelivered: integer('quantity_delivered').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ==================== Client Credits (Carteira - COM-45 a COM-52) ====================
export const clientCredits = pgTable('client_credits', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  clientId: uuid('client_id')
    .notNull()
    .references(() => clients.id),
  origin: text('origin', { enum: ['referral', 'return', 'bonus', 'advance', 'adjustment'] })
    .notNull(),
  originId: uuid('origin_id'),
  description: text('description'),
  originalAmount: numeric('original_amount', { precision: 12, scale: 2 }).notNull(),
  usedAmount: numeric('used_amount', { precision: 12, scale: 2 }).notNull().default('0'),
  balance: numeric('balance', { precision: 12, scale: 2 }).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  status: text('status', { enum: ['active', 'used', 'expired', 'cancelled'] })
    .notNull()
    .default('active'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
    .$onUpdate(() => new Date()),
});

// ==================== Client Credit Movements ====================
export const clientCreditMovements = pgTable('client_credit_movements', {
  id: uuid('id').defaultRandom().primaryKey(),
  creditId: uuid('credit_id')
    .notNull()
    .references(() => clientCredits.id, { onDelete: 'cascade' }),
  type: text('type', { enum: ['use', 'reversal'] }).notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  saleId: uuid('sale_id').references(() => sales.id),
  deliveryId: uuid('delivery_id').references(() => saleDeliveries.id),
  userId: uuid('user_id'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
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
  refundType: text('refund_type', { enum: ['money', 'credit', 'decide_later'] }),
  creditGeneratedId: uuid('credit_generated_id'),
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull().default('0'),
  total: numeric('total', { precision: 12, scale: 2 }).notNull().default('0'),
  notes: text('notes'),
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

// ==================== Sale Payments (Pagamentos Mix Livre - COM-Payments) ====================
export const salePayments = pgTable('sale_payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  saleId: uuid('sale_id')
    .references(() => sales.id, { onDelete: 'cascade' }),
  quoteId: uuid('quote_id')
    .references(() => quotes.id, { onDelete: 'cascade' }),
  paymentMethod: varchar('payment_method', { length: 50 }).notNull(),
  installmentNumber: integer('installment_number').notNull().default(1),
  totalInstallments: integer('total_installments').notNull().default(1),
  documentNumber: varchar('document_number', { length: 50 }),
  dueDate: timestamp('due_date', { withTimezone: true }),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  status: text('status', { enum: ['pending', 'paid', 'overdue', 'cancelled'] })
    .notNull()
    .default('pending'),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
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
  productCondition: text('product_condition', { enum: ['new', 'good', 'damaged', 'defective'] }),
});
