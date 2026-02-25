import type {
  Warehouse, CreateWarehouseDTO, UpdateWarehouseDTO,
  StockLevel,
  StockMovement, CreateMovementDTO,
  StockTransfer, CreateTransferDTO,
  InventoryCount, CreateInventoryCountDTO, RegisterCountItemDTO,
  StockSettings, UpdateStockSettingsDTO,
  StockDashboard,
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
  create(tenantId: string, userId: string, data: CreateMovementDTO): Promise<StockMovement>;
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
