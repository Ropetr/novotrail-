// ==================== Warehouse ====================
export interface Warehouse {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  type: 'main' | 'branch' | 'transit' | 'defective';
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  isActive: boolean;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWarehouseDTO {
  name: string;
  code: string;
  type?: 'main' | 'branch' | 'transit' | 'defective';
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  notes?: string;
}

export interface UpdateWarehouseDTO {
  name?: string;
  code?: string;
  type?: 'main' | 'branch' | 'transit' | 'defective';
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  isActive?: boolean;
  notes?: string;
}

// ==================== Stock Level ====================
export interface StockLevel {
  id: string;
  tenantId: string;
  productId: string;
  warehouseId: string;
  quantity: string;
  reservedQty: string;
  averageCost: string;
  lastPurchaseCost: string | null;
  minStock: string | null;
  maxStock: string | null;
  updatedAt: Date;
}

export interface StockLevelWithDetails extends StockLevel {
  productName?: string;
  productSku?: string;
  warehouseName?: string;
  available?: number;
}

// ==================== Stock Movement ====================
export type MovementType =
  | 'purchase_in'
  | 'sale_out'
  | 'return_in'
  | 'transfer_in'
  | 'transfer_out'
  | 'adjustment'
  | 'damage'
  | 'loss'
  | 'bonus_out';

export interface StockMovement {
  id: string;
  tenantId: string;
  productId: string;
  warehouseId: string;
  type: MovementType;
  quantity: string;
  unitCost: string | null;
  totalCost: string | null;
  referenceType: string | null;
  referenceId: string | null;
  batchId: string | null;
  reason: string | null;
  notes: string | null;
  createdBy: string | null;
  createdAt: Date;
}

export interface CreateMovementDTO {
  productId: string;
  warehouseId: string;
  type: MovementType;
  quantity: number;
  unitCost?: number;
  referenceType?: string;
  referenceId?: string;
  batchId?: string;
  reason?: string;
  notes?: string;
}

export interface TransferDTO {
  productId: string;
  sourceWarehouseId: string;
  destinationWarehouseId: string;
  quantity: number;
  reason?: string;
  notes?: string;
}

// ==================== Product Batch ====================
export interface ProductBatch {
  id: string;
  tenantId: string;
  productId: string;
  warehouseId: string;
  batchNumber: string;
  quantity: string;
  unitCost: string | null;
  expirationDate: Date | null;
  manufacturingDate: Date | null;
  status: 'active' | 'expired' | 'consumed' | 'quarantine';
  createdAt: Date;
  updatedAt: Date;
}

// ==================== Inventory Count ====================
export type InventoryCountStatus = 'draft' | 'counting' | 'review' | 'approved' | 'cancelled';

export interface InventoryCount {
  id: string;
  tenantId: string;
  warehouseId: string;
  number: string;
  status: InventoryCountStatus;
  startedAt: Date | null;
  completedAt: Date | null;
  approvedBy: string | null;
  notes: string | null;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryCountItem {
  id: string;
  inventoryCountId: string;
  productId: string;
  systemQty: string | null;
  countedQty: string | null;
  difference: string | null;
  notes: string | null;
  countedAt: Date | null;
}

export interface CreateInventoryCountDTO {
  warehouseId: string;
  notes?: string;
}

export interface CountItemDTO {
  productId: string;
  countedQty: number;
  notes?: string;
}

export interface InventoryCountWithItems extends InventoryCount {
  items: InventoryCountItem[];
}
