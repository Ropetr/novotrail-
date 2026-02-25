import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';
import { tenants } from '../../tenant/infrastructure/schema';

/**
 * Configurações do módulo de Estoque por tenant.
 * Cada tenant pode personalizar o comportamento do estoque.
 *
 * Baseado no benchmarking: VHSYS, Bling, Conta Azul, Omie, Tray, Tiny
 * e nas recomendações da mesa redonda GPT-4.1 + Claude Sonnet 4.
 */
export const stockSettings = pgTable('stock_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' })
    .unique(),

  // --- Regras de Custeio ---
  costMethod: text('cost_method', {
    enum: ['weighted_average', 'last_purchase', 'fifo'],
  })
    .notNull()
    .default('weighted_average'),

  // --- Comportamento de Estoque ---
  allowNegativeStock: boolean('allow_negative_stock').notNull().default(false),
  blockSaleWithoutStock: boolean('block_sale_without_stock').notNull().default(true),
  defaultWarehouseId: uuid('default_warehouse_id'),

  // --- Automações ---
  autoStockInOnPurchase: boolean('auto_stock_in_on_purchase').notNull().default(true),
  autoStockOutOnSale: boolean('auto_stock_out_on_sale').notNull().default(true),
  autoCreateProductFromNfe: boolean('auto_create_product_from_nfe').notNull().default(false),

  // --- Reservas ---
  reservationTtlHours: integer('reservation_ttl_hours').notNull().default(24),

  // --- Conferência e Recebimento ---
  requireReceiptConfirmation: boolean('require_receipt_confirmation').notNull().default(true),
  maxDivergencePercent: integer('max_divergence_percent').notNull().default(5),
  enableBarcodeValidation: boolean('enable_barcode_validation').notNull().default(true),

  // --- Inventário ---
  inventoryFreezeOnCount: boolean('inventory_freeze_on_count').notNull().default(true),

  // --- Lotes e Validade ---
  enableLotControl: boolean('enable_lot_control').notNull().default(false),
  enableExpiryAlerts: boolean('enable_expiry_alerts').notNull().default(true),
  expiryWarningDays: integer('expiry_warning_days').notNull().default(30),

  // --- Alertas ---
  enableMinStockAlerts: boolean('enable_min_stock_alerts').notNull().default(true),
  alertEmailRecipients: jsonb('alert_email_recipients').default('[]'),

  // --- Integrações ---
  syncMarketplaceStock: boolean('sync_marketplace_stock').notNull().default(false),
  webhookStockChangeUrl: text('webhook_stock_change_url'),

  // --- Timestamps ---
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
