import { pgTable, uuid, varchar, text, timestamp, numeric, integer, boolean, uniqueIndex } from 'drizzle-orm/pg-core';
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
  isKit: boolean('is_kit').notNull().default(false),
  controlsBatch: boolean('controls_batch').notNull().default(false),
  controlsSerial: boolean('controls_serial').notNull().default(false),
  notes: text('notes'),
  // ==================== Campos Fiscais (Onda 0) ====================
  ncm: varchar('ncm', { length: 8 }),                                    // NCM obrigatório para NF-e
  cest: varchar('cest', { length: 7 }),                                   // CEST se substituição tributária
  origem: integer('origem').default(0),                                   // 0=Nacional, 1=Estrangeira...
  gtinTributavel: varchar('gtin_tributavel', { length: 14 }),
  unidadeTributavel: varchar('unidade_tributavel', { length: 6 }),
  pesoBruto: numeric('peso_bruto', { precision: 12, scale: 3 }).default('0'),
  pesoLiquido: numeric('peso_liquido', { precision: 12, scale: 3 }).default('0'),
  informacoesAdicionais: text('informacoes_adicionais'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ==================== Product Tax Rules (Regras Tributárias por Produto) ====================
export const productTaxRules = pgTable('product_tax_rules', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),

  // Contexto da regra
  ufDestino: varchar('uf_destino', { length: 2 }),
  tipoOperacao: varchar('tipo_operacao', { length: 20 }).notNull().default('venda'),
  tipoCliente: varchar('tipo_cliente', { length: 20 }).default('contribuinte'),

  // CFOP
  cfopDentroEstado: varchar('cfop_dentro_estado', { length: 4 }).notNull(),
  cfopForaEstado: varchar('cfop_fora_estado', { length: 4 }).notNull(),

  // ICMS
  cstIcms: varchar('cst_icms', { length: 3 }),
  csosn: varchar('csosn', { length: 4 }),
  aliquotaIcms: numeric('aliquota_icms', { precision: 5, scale: 2 }).default('0'),
  aliquotaIcmsSt: numeric('aliquota_icms_st', { precision: 5, scale: 2 }).default('0'),
  reducaoBc: numeric('reducao_bc', { precision: 5, scale: 2 }).default('0'),
  mva: numeric('mva', { precision: 5, scale: 2 }).default('0'),
  aliquotaIcmsInterestadual: numeric('aliquota_icms_interestadual', { precision: 5, scale: 2 }),

  // IPI
  cstIpi: varchar('cst_ipi', { length: 2 }).default('99'),
  aliquotaIpi: numeric('aliquota_ipi', { precision: 5, scale: 2 }).default('0'),

  // PIS
  cstPis: varchar('cst_pis', { length: 2 }).default('49'),
  aliquotaPis: numeric('aliquota_pis', { precision: 5, scale: 2 }).default('0'),

  // COFINS
  cstCofins: varchar('cst_cofins', { length: 2 }).default('49'),
  aliquotaCofins: numeric('aliquota_cofins', { precision: 5, scale: 2 }).default('0'),

  // Benefício Fiscal
  codigoBeneficio: varchar('codigo_beneficio', { length: 10 }),

  // Controle
  isDefault: boolean('is_default').default(true),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
}, (table) => [
  uniqueIndex('product_tax_rules_unique').on(
    table.tenantId, table.productId, table.tipoOperacao, table.ufDestino, table.tipoCliente
  ),
]);
