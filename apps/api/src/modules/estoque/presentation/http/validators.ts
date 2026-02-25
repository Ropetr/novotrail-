import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
});

export const idParamSchema = z.object({
  id: z.string().uuid(),
});

// ==================== Warehouse ====================
export const createWarehouseSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório').max(200),
  code: z.string().min(1, 'Código obrigatório').max(50),
  type: z.enum(['main', 'branch', 'transit', 'defective']).default('main'),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().max(2).optional(),
  zipCode: z.string().max(10).optional(),
  notes: z.string().optional(),
});

export const updateWarehouseSchema = createWarehouseSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// ==================== Stock Movement ====================
export const createMovementSchema = z.object({
  productId: z.string().uuid('ID do produto inválido'),
  warehouseId: z.string().uuid('ID do depósito inválido'),
  type: z.enum([
    'purchase_in',
    'sale_out',
    'return_in',
    'transfer_in',
    'transfer_out',
    'adjustment',
    'damage',
    'loss',
    'bonus_out',
  ]),
  quantity: z.number().positive('Quantidade deve ser positiva'),
  unitCost: z.number().nonnegative().optional(),
  referenceType: z.string().optional(),
  referenceId: z.string().uuid().optional(),
  batchId: z.string().uuid().optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

export const transferSchema = z.object({
  productId: z.string().uuid('ID do produto inválido'),
  sourceWarehouseId: z.string().uuid('ID do depósito de origem inválido'),
  destinationWarehouseId: z.string().uuid('ID do depósito de destino inválido'),
  quantity: z.number().positive('Quantidade deve ser positiva'),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

// ==================== Stock Level ====================
export const stockLevelQuerySchema = paginationSchema.extend({
  warehouseId: z.string().uuid().optional(),
});

export const movementQuerySchema = paginationSchema.extend({
  productId: z.string().uuid().optional(),
  warehouseId: z.string().uuid().optional(),
  type: z.string().optional(),
});

// ==================== Inventory Count ====================
export const createInventoryCountSchema = z.object({
  warehouseId: z.string().uuid('ID do depósito inválido'),
  notes: z.string().optional(),
});

export const countItemSchema = z.object({
  productId: z.string().uuid('ID do produto inválido'),
  countedQty: z.number().nonnegative('Quantidade contada deve ser >= 0'),
  notes: z.string().optional(),
});
