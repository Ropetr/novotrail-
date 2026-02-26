import type {
  Warehouse, CreateWarehouseDTO, UpdateWarehouseDTO,
  StockLevel,
  StockMovement, CreateMovementDTO,
  StockTransfer, CreateTransferDTO,
  InventoryCount, CreateInventoryCountDTO, RegisterCountItemDTO,
  StockSettings, UpdateStockSettingsDTO,
  StockDashboard,
  ProductKit, CreateKitDTO, UpdateKitDTO,
  ProductionOrder, CreateProductionOrderDTO, ProductionStatus,
  StockBatch, CreateBatchDTO,
  StockSerial, CreateSerialDTO, SerialStatus,
  StockReservation, CreateReservationDTO, ReservationStatus,
  InventoryScan, CreateScanDTO,
} from './entities';

export interface ListResult<T> {
  data: T[];
  total: number;
}

export interface PaginationInput {
  page: number;
  limit: number;
  search?: string;
}

// ==================== Warehouse Repository ====================
export interface IWarehouseRepository {
  list(tenantId: string, params: PaginationInput): Promise<ListResult<Warehouse>>;
  getById(id: string, tenantId: string): Promise<Warehouse | null>;
  create(tenantId: string, data: CreateWarehouseDTO): Promise<Warehouse>;
  update(id: string, tenantId: string, data: UpdateWarehouseDTO): Promise<Warehouse>;
  remove(id: string, tenantId: string): Promise<void>;
}

// ==================== Stock Level Repository ====================
export interface IStockLevelRepository {
  list(tenantId: string, params: PaginationInput & {
    warehouseId?: string;
    lowStockOnly?: boolean;
  }): Promise<ListResult<StockLevel>>;
  getByProduct(productId: string, tenantId: string): Promise<StockLevel[]>;
  getOrCreate(tenantId: string, productId: string, warehouseId: string): Promise<StockLevel>;
  updateLevel(id: string, quantity: string, averageCost: string): Promise<StockLevel>;
  getDashboard(tenantId: string): Promise<StockDashboard>;
}

// ==================== Stock Movement Repository ====================
export interface IStockMovementRepository {
  list(tenantId: string, params: PaginationInput & {
    warehouseId?: string;
    productId?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ListResult<StockMovement>>;
  getById(id: string, tenantId: string): Promise<StockMovement | null>;
  create(tenantId: string, userId: string, data: CreateMovementDTO, options?: { allowNegativeStock?: boolean }): Promise<StockMovement>;
}

// ==================== Stock Transfer Repository ====================
export interface IStockTransferRepository {
  list(tenantId: string, params: PaginationInput & {
    status?: string;
  }): Promise<ListResult<StockTransfer>>;
  getById(id: string, tenantId: string): Promise<StockTransfer | null>;
  create(tenantId: string, userId: string, data: CreateTransferDTO): Promise<StockTransfer>;
  updateStatus(id: string, tenantId: string, status: string, extra?: Record<string, any>): Promise<StockTransfer>;
}

// ==================== Inventory Count Repository ====================
export interface IInventoryCountRepository {
  list(tenantId: string, params: PaginationInput & {
    status?: string;
    warehouseId?: string;
  }): Promise<ListResult<InventoryCount>>;
  getById(id: string, tenantId: string): Promise<InventoryCount | null>;
  create(tenantId: string, userId: string, data: CreateInventoryCountDTO): Promise<InventoryCount>;
  registerItem(countId: string, userId: string, data: RegisterCountItemDTO): Promise<void>;
  approve(id: string, tenantId: string, userId: string): Promise<InventoryCount>;
}

// ==================== Stock Settings Repository ====================
export interface IStockSettingsRepository {
  get(tenantId: string): Promise<StockSettings>;
  update(tenantId: string, data: UpdateStockSettingsDTO): Promise<StockSettings>;
}

// ==================== Kit Repository ====================
export interface IKitRepository {
  listKits(tenantId: string): Promise<Array<{ kitProductId: string; kitName: string; kitCode: string; components: ProductKit[] }>>;
  getKit(kitProductId: string, tenantId: string): Promise<{ kitProductId: string; kitName: string; components: ProductKit[] } | null>;
  createKit(tenantId: string, data: CreateKitDTO): Promise<ProductKit[]>;
  updateKit(kitProductId: string, tenantId: string, data: UpdateKitDTO): Promise<ProductKit[]>;
  deleteKit(kitProductId: string, tenantId: string): Promise<void>;
  getComponents(kitProductId: string, tenantId: string): Promise<ProductKit[]>;
}

// ==================== Production Order Repository ====================
export interface IProductionOrderRepository {
  list(tenantId: string, params: PaginationInput & { status?: string }): Promise<ListResult<ProductionOrder>>;
  getById(id: string, tenantId: string): Promise<ProductionOrder | null>;
  create(tenantId: string, userId: string, data: CreateProductionOrderDTO): Promise<ProductionOrder>;
  updateStatus(id: string, tenantId: string, status: ProductionStatus, userId: string): Promise<ProductionOrder>;
}

// ==================== Batch Repository ====================
export interface IBatchRepository {
  list(tenantId: string, params: PaginationInput & { productId?: string; warehouseId?: string; expiredOnly?: boolean }): Promise<ListResult<StockBatch>>;
  getById(id: string, tenantId: string): Promise<StockBatch | null>;
  create(tenantId: string, data: CreateBatchDTO): Promise<StockBatch>;
  updateQuantity(id: string, tenantId: string, quantityDelta: number): Promise<StockBatch>;
  getFifo(productId: string, warehouseId: string, tenantId: string): Promise<StockBatch[]>;
}

// ==================== Serial Repository ====================
export interface ISerialRepository {
  list(tenantId: string, params: PaginationInput & { productId?: string; warehouseId?: string; status?: SerialStatus }): Promise<ListResult<StockSerial>>;
  getById(id: string, tenantId: string): Promise<StockSerial | null>;
  create(tenantId: string, data: CreateSerialDTO): Promise<StockSerial>;
  updateStatus(id: string, tenantId: string, status: SerialStatus, movementId?: string): Promise<StockSerial>;
  getBySerialNumber(serialNumber: string, tenantId: string): Promise<StockSerial | null>;
}

// ==================== Reservation Repository ====================
export interface IReservationRepository {
  list(tenantId: string, params: PaginationInput & { productId?: string; status?: string; orderId?: string }): Promise<ListResult<StockReservation>>;
  getById(id: string, tenantId: string): Promise<StockReservation | null>;
  create(tenantId: string, userId: string, data: CreateReservationDTO): Promise<StockReservation>;
  updateStatus(id: string, tenantId: string, status: ReservationStatus): Promise<StockReservation>;
  getByOrder(orderId: string, tenantId: string): Promise<StockReservation[]>;
}

// ==================== Inventory Scan Repository ====================
export interface IScanRepository {
  listByInventory(inventoryCountId: string, tenantId: string): Promise<InventoryScan[]>;
  create(tenantId: string, userId: string, inventoryCountId: string, data: CreateScanDTO): Promise<InventoryScan>;
}
