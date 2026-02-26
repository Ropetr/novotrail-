import { z } from 'zod';

// ==================== Common ====================
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
});

export const idParamSchema = z.object({
  id: z.string().uuid(),
});

// ==================== Warehouse ====================
export const createWarehouseSchema = z.object({
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(100),
  type: z.enum(['main', 'branch', 'transit', 'third_party']).optional(),
  address: z.string().optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(2).optional(),
  responsible: z.string().max(100).optional(),
  isDefault: z.boolean().optional(),
  notes: z.string().optional(),
});

export const updateWarehouseSchema = createWarehouseSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// ==================== Stock Levels ====================
export const stockLevelListSchema = paginationSchema.extend({
  warehouseId: z.string().uuid().optional(),
  lowStockOnly: z.coerce.boolean().optional(),
});

export const productIdParamSchema = z.object({
  productId: z.string().uuid(),
});

// ==================== Stock Movements ====================
export const movementListSchema = paginationSchema.extend({
  warehouseId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  type: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const createMovementSchema = z.object({
  warehouseId: z.string().uuid(),
  productId: z.string().uuid(),
  type: z.enum([
    'purchase_entry', 'sale_exit', 'transfer_in', 'transfer_out',
    'adjustment_in', 'adjustment_out', 'return_in', 'return_out', 'production',
  ]),
  quantity: z.number().positive(),
  unitCost: z.number().min(0).optional(),
  referenceType: z.string().optional(),
  referenceId: z.string().uuid().optional(),
  referenceNumber: z.string().optional(),
  reason: z.string().optional(),
});

// ==================== Stock Transfers ====================
export const transferListSchema = paginationSchema.extend({
  status: z.string().optional(),
});

export const createTransferSchema = z.object({
  fromWarehouseId: z.string().uuid(),
  toWarehouseId: z.string().uuid(),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().positive(),
    unitCost: z.number().min(0).optional(),
  })).min(1),
}).refine(data => data.fromWarehouseId !== data.toWarehouseId, {
  message: 'Origin and destination warehouses must be different',
});

// ==================== Inventory Counts ====================
export const inventoryListSchema = paginationSchema.extend({
  status: z.string().optional(),
  warehouseId: z.string().uuid().optional(),
});

export const createInventoryCountSchema = z.object({
  warehouseId: z.string().uuid(),
  type: z.enum(['full', 'partial', 'cyclic']).optional(),
  blindCount: z.boolean().optional(),
  notes: z.string().optional(),
  productIds: z.array(z.string().uuid()).optional(),
});

export const registerCountItemSchema = z.object({
  productId: z.string().uuid(),
  countedQuantity: z.number().min(0),
  notes: z.string().optional(),
});

// ==================== Stock Settings ====================
export const updateStockSettingsSchema = z.object({
  defaultWarehouseId: z.string().uuid().optional(),
  costMethod: z.enum(['average', 'fifo', 'lifo']).optional(),
  allowNegativeStock: z.boolean().optional(),
  autoGenerateMovements: z.boolean().optional(),
  lowStockAlertEnabled: z.boolean().optional(),
});

// ==================== Kits / BOM ====================
export const createKitSchema = z.object({
  kitProductId: z.string().uuid(),
  components: z.array(z.object({
    componentProductId: z.string().uuid(),
    quantity: z.number().positive(),
  })).min(1),
});

export const updateKitSchema = z.object({
  components: z.array(z.object({
    componentProductId: z.string().uuid(),
    quantity: z.number().positive(),
  })).min(1),
});

// ==================== Production Orders ====================
export const createProductionOrderSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().positive(),
  warehouseId: z.string().uuid(),
  notes: z.string().optional(),
});

export const productionStatusSchema = z.object({
  status: z.enum(['in_progress', 'finished', 'cancelled']),
});

export const productionListSchema = paginationSchema.extend({
  status: z.enum(['draft', 'in_progress', 'finished', 'cancelled']).optional(),
});

// ==================== Batches (Lotes) ====================
export const createBatchSchema = z.object({
  productId: z.string().uuid(),
  warehouseId: z.string().uuid(),
  batchCode: z.string().min(1).max(50),
  expirationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  quantity: z.number().min(0),
  notes: z.string().optional(),
});

export const batchListSchema = paginationSchema.extend({
  productId: z.string().uuid().optional(),
  warehouseId: z.string().uuid().optional(),
  expiredOnly: z.coerce.boolean().optional(),
});

// ==================== Serials (Números de Série) ====================
export const createSerialSchema = z.object({
  productId: z.string().uuid(),
  warehouseId: z.string().uuid(),
  serialNumber: z.string().min(1).max(100),
});

export const serialListSchema = paginationSchema.extend({
  productId: z.string().uuid().optional(),
  warehouseId: z.string().uuid().optional(),
  status: z.enum(['available', 'reserved', 'sold', 'returned']).optional(),
});

// ==================== Reservations ====================
export const createReservationSchema = z.object({
  orderId: z.string().uuid().optional(),
  orderType: z.string().max(30).optional(),
  productId: z.string().uuid(),
  warehouseId: z.string().uuid(),
  quantity: z.number().positive(),
  expiresAt: z.string().optional(),
});

export const reservationListSchema = paginationSchema.extend({
  productId: z.string().uuid().optional(),
  status: z.enum(['reserved', 'consumed', 'released', 'cancelled', 'expired']).optional(),
  orderId: z.string().uuid().optional(),
});

export const reservationStatusSchema = z.object({
  status: z.enum(['consumed', 'released', 'cancelled']),
});

// ==================== Inventory Scans (Bipagem) ====================
export const createScanSchema = z.object({
  barcode: z.string().max(50).optional(),
  productId: z.string().uuid().optional(),
  quantity: z.number().positive().optional(),
});

// ==================== Integration (From Sale) ====================
export const fromSaleSchema = z.object({
  saleId: z.string().uuid(),
  warehouseId: z.string().uuid(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().positive(),
    unitCost: z.number().min(0).optional(),
  })).min(1),
});
