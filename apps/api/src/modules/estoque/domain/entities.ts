// ==================== Warehouse ====================
export interface Warehouse {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  type: 'main' | 'branch' | 'transit' | 'third_party';
  address?: string | null;
  city?: string | null;
  state?: string | null;
  responsible?: string | null;
  isActive: boolean;
  isDefault: boolean;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWarehouseDTO {
  code: string;
  name: string;
  type?: 'main' | 'branch' | 'transit' | 'third_party';
  address?: string;
  city?: string;
  state?: string;
  responsible?: string;
  isDefault?: boolean;
  notes?: string;
}

export interface UpdateWarehouseDTO extends Partial<CreateWarehouseDTO> {
  isActive?: boolean;
}

// ==================== Stock Level ====================
export interface StockLevel {
  id: string;
  tenantId: string;
  productId: string;
  warehouseId: string;
  quantity: string;
  reservedQuantity: string;
  availableQuantity: string;
  averageCost: string;
  lastMovementAt?: Date | null;
  updatedAt: Date;
}

// ==================== Stock Movement ====================
export type MovementType =
  | 'purchase_entry' | 'sale_exit'
  | 'transfer_in' | 'transfer_out'
  | 'adjustment_in' | 'adjustment_out'
  | 'return_in' | 'return_out'
  | 'production';

export interface StockMovement {
  id: string;
  tenantId: string;
  warehouseId: string;
  productId: string;
  type: MovementType;
  quantity: string;
  unitCost: string;
  totalCost: string;
  previousQuantity: string;
  newQuantity: string;
  previousAverageCost: string;
  newAverageCost: string;
  referenceType?: string | null;
  referenceId?: string | null;
  referenceNumber?: string | null;
  reason?: string | null;
  batchId?: string | null;
  serialId?: string | null;
  userId: string;
  createdAt: Date;
}

export interface CreateMovementDTO {
  warehouseId: string;
  productId: string;
  type: MovementType;
  quantity: number;
  unitCost?: number;
  referenceType?: string;
  referenceId?: string;
  referenceNumber?: string;
  reason?: string;
  batchId?: string;
  serialId?: string;
}

// ==================== Stock Transfer ====================
export interface StockTransfer {
  id: string;
  tenantId: string;
  number: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  status: 'draft' | 'in_transit' | 'received' | 'cancelled';
  notes?: string | null;
  userId: string;
  shippedAt?: Date | null;
  receivedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  items?: StockTransferItem[];
}

export interface StockTransferItem {
  id: string;
  transferId: string;
  productId: string;
  quantity: string;
  unitCost: string;
}

export interface CreateTransferDTO {
  fromWarehouseId: string;
  toWarehouseId: string;
  notes?: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitCost?: number;
  }>;
}

// ==================== Inventory Count ====================
export interface InventoryCount {
  id: string;
  tenantId: string;
  number: string;
  warehouseId: string;
  status: 'draft' | 'counting' | 'review' | 'approved' | 'cancelled';
  type: 'full' | 'partial' | 'cyclic';
  blindCount: boolean;
  notes?: string | null;
  userId: string;
  approvedBy?: string | null;
  approvedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  items?: InventoryCountItem[];
}

export interface InventoryCountItem {
  id: string;
  countId: string;
  productId: string;
  systemQuantity: string;
  countedQuantity?: string | null;
  difference?: string | null;
  status: 'pending' | 'counted' | 'adjusted';
  notes?: string | null;
  countedBy?: string | null;
  countedAt?: Date | null;
}

export interface CreateInventoryCountDTO {
  warehouseId: string;
  type?: 'full' | 'partial' | 'cyclic';
  blindCount?: boolean;
  notes?: string;
  productIds?: string[]; // para contagem parcial
}

export interface RegisterCountItemDTO {
  productId: string;
  countedQuantity: number;
  notes?: string;
}

// ==================== Stock Settings ====================
export interface StockSettings {
  id: string;
  tenantId: string;
  defaultWarehouseId?: string | null;
  costMethod: 'average' | 'fifo' | 'lifo';
  allowNegativeStock: boolean;
  autoGenerateMovements: boolean;
  lowStockAlertEnabled: boolean;
  updatedAt: Date;
}

export interface UpdateStockSettingsDTO {
  defaultWarehouseId?: string;
  costMethod?: 'average' | 'fifo' | 'lifo';
  allowNegativeStock?: boolean;
  autoGenerateMovements?: boolean;
  lowStockAlertEnabled?: boolean;
}

// ==================== Dashboard ====================
export interface StockDashboard {
  totalProducts: number;
  totalWarehouses: number;
  totalValue: number;
  lowStockAlerts: Array<{
    productId: string;
    productName: string;
    productCode: string;
    currentQuantity: number;
    minStock: number;
    warehouseId: string;
    warehouseName: string;
  }>;
  recentMovements: StockMovement[];
}

// ==================== Product Kit / BOM ====================
export interface ProductKit {
  id: string;
  tenantId: string;
  kitProductId: string;
  componentProductId: string;
  quantity: string;
  createdAt: Date;
  componentName?: string;
  componentCode?: string;
  componentUnit?: string;
}

export interface CreateKitDTO {
  kitProductId: string;
  components: Array<{
    componentProductId: string;
    quantity: number;
  }>;
}

export interface UpdateKitDTO {
  components: Array<{
    componentProductId: string;
    quantity: number;
  }>;
}

// ==================== Production Order ====================
export type ProductionStatus = 'draft' | 'in_progress' | 'finished' | 'cancelled';

export interface ProductionOrder {
  id: string;
  tenantId: string;
  code: string;
  status: ProductionStatus;
  productId: string;
  quantity: string;
  warehouseId: string;
  notes?: string | null;
  startedAt?: Date | null;
  finishedAt?: Date | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  items?: ProductionOrderItem[];
  productName?: string;
  warehouseName?: string;
}

export interface ProductionOrderItem {
  id: string;
  productionOrderId: string;
  productId: string;
  quantityRequired: string;
  quantityConsumed: string;
  productName?: string;
  productCode?: string;
}

export interface CreateProductionOrderDTO {
  productId: string;
  quantity: number;
  warehouseId: string;
  notes?: string;
}

// ==================== Stock Batch (Lote) ====================
export interface StockBatch {
  id: string;
  tenantId: string;
  productId: string;
  warehouseId: string;
  batchCode: string;
  expirationDate?: string | null;
  quantity: string;
  notes?: string | null;
  createdAt: Date;
  productName?: string;
  warehouseName?: string;
  isExpired?: boolean;
}

export interface CreateBatchDTO {
  productId: string;
  warehouseId: string;
  batchCode: string;
  expirationDate?: string;
  quantity: number;
  notes?: string;
}

// ==================== Stock Serial (Número de Série) ====================
export type SerialStatus = 'available' | 'reserved' | 'sold' | 'returned';

export interface StockSerial {
  id: string;
  tenantId: string;
  productId: string;
  warehouseId: string;
  serialNumber: string;
  status: SerialStatus;
  movementId?: string | null;
  createdAt: Date;
  productName?: string;
  warehouseName?: string;
}

export interface CreateSerialDTO {
  productId: string;
  warehouseId: string;
  serialNumber: string;
}

// ==================== Stock Reservation ====================
export type ReservationStatus = 'reserved' | 'consumed' | 'released' | 'cancelled' | 'expired';

export interface StockReservation {
  id: string;
  tenantId: string;
  orderId?: string | null;
  orderType?: string | null;
  productId: string;
  warehouseId: string;
  quantity: string;
  status: ReservationStatus;
  expiresAt?: Date | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  productName?: string;
  warehouseName?: string;
}

export interface CreateReservationDTO {
  orderId?: string;
  orderType?: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  expiresAt?: string;
}

// ==================== Inventory Scan (Bipagem) ====================
export interface InventoryScan {
  id: string;
  tenantId: string;
  inventoryCountId: string;
  productId: string;
  barcode?: string | null;
  quantity: string;
  userId: string;
  scannedAt: Date;
}

export interface CreateScanDTO {
  barcode?: string;
  productId?: string;
  quantity?: number;
}

// ==================== Integration ====================
export interface FromSaleDTO {
  saleId: string;
  warehouseId: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitCost?: number;
  }>;
}
