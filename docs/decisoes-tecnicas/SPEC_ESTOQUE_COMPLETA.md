# ESPECIFICAÇÃO TÉCNICA DEFINITIVA – MÓDULO DE ESTOQUE (EXPANSÃO)

**Projeto:** NovoTrail ERP  
**Stack:** Cloudflare Workers + Hono + Drizzle ORM + Neon PostgreSQL + React 18  
**Arquitetura:** Clean Architecture (domain, application, infrastructure, presentation)  
**Multi-tenant:** `tenantId` em todas as tabelas  
**IDs:** UUID  
**Valores:** `numeric(15,2)` para dinheiro, `numeric(15,4)` para quantidade  
**Timestamps:** sempre com timezone  
**Cliente:** PLANAC (materiais de construção)

---

## 1. CONTEXTO

O módulo de Estoque atual é um MVP com 7 tabelas e 21 endpoints. Ele precisa ser expandido para atender às necessidades de um ERP completo, com base no benchmarking de 6 ERPs brasileiros (VHSYS, Bling, Conta Azul, Omie, Tray, Tiny) e nas melhores práticas de mercado. Esta especificação detalha a expansão necessária.

---

## 2. FUNCIONALIDADES (DIFERENCIAIS)

- **Kits/BOM (produtos compostos)**: baixa automática de componentes na venda/produção
- **Reserva automática de estoque**: pedidos bloqueiam saldo disponível
- **Controle de lotes, validade, número de série**: rastreabilidade total
- **Inventário por bipagem**: leitura de código de barras
- **Controle de produção**: ordem de produção, consumo de insumos, geração de produto acabado
- **Localização física (endereçamento)**: produto por posição no depósito
- **Alertas inteligentes**: min/max, curva ABC, giro, vencimento
- **Rastreabilidade detalhada**: histórico de movimentações por lote/série
- **Sincronização automática**: Fiscal (DF-e Inbox), Comercial (vendas), Multi-canal (e-commerce)
- **Aprovação de inventário (workflow)**
- **Auditoria/versionamento**: logs de alterações sensíveis

---

## 3. SCHEMAS DRIZZLE (completo, copy-paste ready)

```typescript
// Imports padrão
import { pgTable, uuid, text, numeric, timestamp, boolean, integer, varchar, index, date } from "drizzle-orm/pg-core";
import { tenants } from "../../tenant/infrastructure/schema";
import { products } from "../../produtos/infrastructure/schema";
import { warehouses, stockMovements, inventoryCounts, users } from "./schema"; // Schemas existentes

// 1. Kits/BOM
export const productKits = pgTable("product_kits", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  kitProductId: uuid("kit_product_id").notNull().references(() => products.id),
  componentProductId: uuid("component_product_id").notNull().references(() => products.id),
  quantity: numeric("quantity", { precision: 15, scale: 4 }).notNull(),
  isOptional: boolean("is_optional").default(false),
  sequence: integer("sequence").default(1),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  tenantIdx: index("product_kits_tenant_idx").on(table.tenantId),
  kitIdx: index("product_kits_kit_idx").on(table.kitProductId),
}));

// 2. Ordens de Produção
export const productionOrders = pgTable("production_orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  code: varchar("code", { length: 30 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(), // draft, in_progress, finished, canceled
  productId: uuid("product_id").notNull().references(() => products.id),
  quantity: numeric("quantity", { precision: 15, scale: 4 }).notNull(),
  warehouseId: uuid("warehouse_id").notNull().references(() => warehouses.id),
  startedAt: timestamp("started_at", { withTimezone: true }),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const productionOrderItems = pgTable("production_order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  productionOrderId: uuid("production_order_id").notNull().references(() => productionOrders.id),
  productId: uuid("product_id").notNull().references(() => products.id),
  quantity: numeric("quantity", { precision: 15, scale: 4 }).notNull(),
});

// 3. Lotes
export const stockBatches = pgTable("stock_batches", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  productId: uuid("product_id").notNull().references(() => products.id),
  warehouseId: uuid("warehouse_id").notNull().references(() => warehouses.id),
  batchCode: varchar("batch_code", { length: 50 }).notNull(),
  expirationDate: date("expiration_date"),
  manufacturingDate: date("manufacturing_date"),
  supplierId: uuid("supplier_id").references(() => suppliers.id),
  quantity: numeric("quantity", { precision: 15, scale: 4 }).notNull(),
  availableQuantity: numeric("available_quantity", { precision: 15, scale: 4 }).notNull(),
  blockedQuantity: numeric("blocked_quantity", { precision: 15, scale: 4 }).default("0"),
  unitCost: numeric("unit_cost", { precision: 15, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).default("active"), // active, expired, blocked
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  tenantIdx: index("stock_batches_tenant_idx").on(table.tenantId),
  productWarehouseIdx: index("stock_batches_product_warehouse_idx").on(table.productId, table.warehouseId),
  expirationIdx: index("stock_batches_expiration_idx").on(table.expirationDate),
}));

// 4. Números de Série (normalizado)
export const stockSerials = pgTable("stock_serials", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  productId: uuid("product_id").notNull().references(() => products.id),
  batchId: uuid("batch_id").references(() => stockBatches.id),
  warehouseId: uuid("warehouse_id").notNull().references(() => warehouses.id),
  serialNumber: varchar("serial_number", { length: 100 }).notNull(),
  status: varchar("status", { length: 20 }).default("available"), // available, sold, returned, blocked
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  serialIdx: index("stock_serials_serial_idx").on(table.serialNumber),
  productIdx: index("stock_serials_product_idx").on(table.productId),
}));

// 5. Reservas de Estoque
export const stockReservations = pgTable("stock_reservations", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  productId: uuid("product_id").notNull().references(() => products.id),
  warehouseId: uuid("warehouse_id").notNull().references(() => warehouses.id),
  batchId: uuid("batch_id").references(() => stockBatches.id),
  serialId: uuid("serial_id").references(() => stockSerials.id),
  quantity: numeric("quantity", { precision: 15, scale: 4 }).notNull(),
  reservationType: varchar("reservation_type", { length: 20 }).notNull(), // sale, production, transfer
  referenceId: uuid("reference_id").notNull(), // ID da venda/produção/etc
  referenceNumber: varchar("reference_number", { length: 50 }),
  expirationDate: timestamp("expiration_date", { withTimezone: true }),
  status: varchar("status", { length: 20 }).default("active"), // active, consumed, expired, cancelled
  userId: uuid("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  tenantIdx: index("stock_reservations_tenant_idx").on(table.tenantId),
  productIdx: index("stock_reservations_product_idx").on(table.productId),
  referenceIdx: index("stock_reservations_reference_idx").on(table.referenceId),
  statusIdx: index("stock_reservations_status_idx").on(table.status),
}));

// 6. Localização física (endereçamento)
export const warehouseLocations = pgTable("warehouse_locations", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  warehouseId: uuid("warehouse_id").notNull().references(() => warehouses.id),
  code: varchar("code", { length: 20 }).notNull(), // Ex: A1-B2-C3
  description: varchar("description", { length: 100 }),
  type: varchar("type", { length: 20 }).default("storage"), // storage, picking, receiving, shipping
  corridor: varchar("corridor", { length: 10 }),
  shelf: varchar("shelf", { length: 10 }),
  level: varchar("level", { length: 10 }),
  position: varchar("position", { length: 10 }),
  maxCapacity: numeric("max_capacity", { precision: 15, scale: 4 }),
  currentOccupancy: numeric("current_occupancy", { precision: 15, scale: 4 }).default("0"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  tenantIdx: index("warehouse_locations_tenant_idx").on(table.tenantId),
  warehouseIdx: index("warehouse_locations_warehouse_idx").on(table.warehouseId),
  codeIdx: index("warehouse_locations_code_idx").on(table.code),
}));

// 7. Produtos por Localização
export const stockLocationLevels = pgTable("stock_location_levels", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  productId: uuid("product_id").notNull().references(() => products.id),
  warehouseId: uuid("warehouse_id").notNull().references(() => warehouses.id),
  locationId: uuid("location_id").notNull().references(() => warehouseLocations.id),
  batchId: uuid("batch_id").references(() => stockBatches.id),
  quantity: numeric("quantity", { precision: 15, scale: 4 }).notNull(),
  reservedQuantity: numeric("reserved_quantity", { precision: 15, scale: 4 }).default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  tenantIdx: index("stock_location_levels_tenant_idx").on(table.tenantId),
  productIdx: index("stock_location_levels_product_idx").on(table.productId),
  locationIdx: index("stock_location_levels_location_idx").on(table.locationId),
}));

// 8. Rastreabilidade (movimentações detalhadas)
export const stockTraces = pgTable("stock_traces", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  movementId: uuid("movement_id").notNull().references(() => stockMovements.id),
  productId: uuid("product_id").notNull().references(() => products.id),
  batchId: uuid("batch_id").references(() => stockBatches.id),
  serialId: uuid("serial_id").references(() => stockSerials.id),
  fromWarehouseId: uuid("from_warehouse_id").references(() => warehouses.id),
  toWarehouseId: uuid("to_warehouse_id").references(() => warehouses.id),
  quantity: numeric("quantity", { precision: 15, scale: 4 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// 9. Inventário por bipagem
export const inventoryScans = pgTable("inventory_scans", {
  id: uuid("id").primaryKey().defaultRandom(),
  inventoryCountId: uuid("inventory_count_id").notNull().references(() => inventoryCounts.id),
  productId: uuid("product_id").notNull().references(() => products.id),
  barcode: varchar("barcode", { length: 100 }),
  quantity: numeric("quantity", { precision: 15, scale: 4 }).notNull(),
  userId: uuid("user_id").notNull().references(() => users.id),
  scannedAt: timestamp("scanned_at", { withTimezone: true }).defaultNow(),
});

// 10. Classificação ABC/XYZ
export const productClassifications = pgTable("product_classifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  productId: uuid("product_id").notNull().references(() => products.id),
  classification: varchar("classification", { length: 10 }).notNull(), // A, B, C, X, Y, Z
  calculatedAt: timestamp("calculated_at", { withTimezone: true }).defaultNow(),
});

// 11. Controle de Garantia
export const productWarranties = pgTable("product_warranties", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  saleId: uuid("sale_id").notNull().references(() => sales.id),
  productId: uuid("product_id").notNull().references(() => products.id),
  customerId: uuid("customer_id").notNull().references(() => customers.id),
  serialId: uuid("serial_id").references(() => stockSerials.id),
  warrantyStart: date("warranty_start").notNull(),
  warrantyEnd: date("warranty_end").notNull(),
  status: varchar("status", { length: 20 }).default("active"), // active, expired, voided
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
```

---

## 4. ENDPOINTS (RESTful)

#### KITS/BOM
- `POST   /kits` – criar kit/BOM
- `GET    /kits` – listar kits
- `GET    /kits/:id` – detalhes do kit
- `PUT    /kits/:id` – editar kit
- `DELETE /kits/:id` – excluir kit

#### PRODUÇÃO
- `POST   /production-orders` – criar ordem de produção
- `GET    /production-orders`
- `GET    /production-orders/:id`
- `PATCH  /production-orders/:id/status` – atualizar status

#### LOTES/SÉRIE
- `GET    /batches` – listar lotes
- `POST   /batches` – criar lote manual
- `GET    /serials` – listar números de série

#### RESERVA DE ESTOQUE
- `POST   /reservations` – reservar estoque para pedido
- `GET    /reservations`
- `PATCH  /reservations/:id/status` – liberar/cancelar reserva

#### INVENTÁRIO (BIPAGEM)
- `POST   /inventory-scans` – registrar bipagem

#### LOCALIZAÇÃO
- `GET    /warehouse-locations`
- `POST   /warehouse-locations`
- `GET    /warehouse-locations/:id`
- `PUT    /warehouse-locations/:id`
- `DELETE /warehouse-locations/:id`

#### RASTREABILIDADE
- `GET    /stock-traces` – histórico detalhado

#### CLASSIFICAÇÃO ABC/XYZ
- `GET    /product-classifications`
- `POST   /product-classifications/recalculate` – recalcular classificação

#### GARANTIA
- `GET    /product-warranties`
- `POST   /product-warranties`

#### INTEGRAÇÃO FISCAL/COMERCIAL
- `POST   /stock-movements/from-fiscal` – entrada via NF-e
- `POST   /stock-movements/from-sale` – saída via venda

---

## 5. REGRAS DE NEGÓCIO

- **Reserva automática**: Ao criar pedido/ordem de produção, gera reserva em `stock_reservations`. Reserva reduz saldo disponível, não o físico.
- **Baixa automática de kits**: Venda de kit gera saída dos componentes conforme BOM.
- **Controle de lotes/série**: Produtos marcados como "controla lote/série" exigem seleção de lote/série em movimentações.
- **FIFO/LIFO/manual**: Saída de estoque pode ser automática (FIFO/LIFO) ou manual (usuário escolhe lote/série).
- **Rastreabilidade**: Toda movimentação vincula lote/série, disponível em `stock_traces`.
- **Inventário**: Contagem cega, bipagem, workflow de aprovação.
- **Auditoria**: Alterações em BOM, inventário, reservas e movimentações são logadas.
- **Sincronização Fiscal/Comercial**: Entrada de NF-e gera movimentação de estoque e conta a pagar; venda gera saída e conta a receber.
- **Concorrência**: Locks otimistas em reservas e movimentações para evitar over-selling.
- **TTL em reservas**: Reservas expiram se não forem consumidas/finalizadas no prazo.

---

## 6. TELAS (FRONTEND)

- **Kits/BOM**: CRUD, visualização hierárquica, histórico de versões
- **Ordens de Produção**: Kanban (draft, in_progress, finished), consumo de insumos, geração de produto acabado
- **Lotes/Séries**: Consulta, filtro por validade, rastreio por lote/série
- **Reservas**: Listagem, status, liberação manual/automática
- **Inventário**: Contagem cega, bipagem (scanner), workflow de aprovação
- **Localização**: Mapa do depósito, consulta por posição, movimentação entre posições
- **Rastreabilidade**: Timeline de movimentações por produto/lote/série
- **Alertas**: Dashboard de min/max, vencimento, giro, cobertura
- **Classificação ABC/XYZ**: Relatórios, recalcular, exportar
- **Garantia**: Consulta por cliente/produto, status, vencimento

---

## 7. INTEGRAÇÃO ENTRE MÓDULOS (EVENTOS DE DOMÍNIO)

- **Ao registrar NF-e de entrada**:  
  - Evento `GoodsReceived` → cria movimentação de estoque (entrada) + título a pagar (financeiro)
- **Ao faturar venda**:  
  - Evento `SaleInvoiced` → cria movimentação de estoque (saída) + título a receber (financeiro)
- **Orquestração**:  
  - Fila de eventos (ex: Redis, Pub/Sub) para garantir atomicidade e reprocessamento em caso de falha
- **Mapeamento de produtos**:  
  - Código interno x GTIN, fallback para cadastro rápido
- **Validações fiscais**:  
  - Conferência de valores, impostos, divergências sinalizadas para usuário

---

## 8. TODOs

- [ ] Implementar os novos schemas no banco de dados
- [ ] Criar os novos endpoints na API
- [ ] Desenvolver as novas telas no frontend
- [ ] Implementar as regras de negócio e integrações
- [ ] Criar testes automatizados para as novas funcionalidades
