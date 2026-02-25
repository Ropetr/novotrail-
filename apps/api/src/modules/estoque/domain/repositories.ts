import type { PaginationInput } from '@trailsystem/types';
import type {
  Warehouse,
  CreateWarehouseDTO,
  UpdateWarehouseDTO,
  StockLevel,
  StockLevelWithDetails,
  StockMovement,
  CreateMovementDTO,
  InventoryCount,
  InventoryCountWithItems,
  CreateInventoryCountDTO,
  CountItemDTO,
} from './entities';

export interface ListResult<T> {
  data: T[];
  total: number;
}

// ==================== Warehouse Repository ====================
export interface IWarehouseRepository {
  list(tenantId: string, params: PaginationInput): Promise<ListResult<Warehouse>>;
  getById(id: string, tenantId: string): Promise<Warehouse | null>;
  create(tenantId: string, data: CreateWarehouseDTO): Promise<Warehouse>;
  update(id: string, tenantId: string, data: UpdateWarehouseDTO): Promise<Warehouse | null>;
  delete(id: string, tenantId: string): Promise<boolean>;
}

// ==================== Stock Level Repository ====================
export interface IStockLevelRepository {
  list(tenantId: string, params: PaginationInput & { warehouseId?: string }): Promise<ListResult<StockLevelWithDetails>>;
  getByProduct(productId: string, tenantId: string, warehouseId?: string): Promise<StockLevel[]>;
  getAlerts(tenantId: string, warehouseId?: string): Promise<StockLevelWithDetails[]>;
  upsert(tenantId: string, productId: string, warehouseId: string, updates: Partial<StockLevel>): Promise<StockLevel>;
}

// ==================== Stock Movement Repository ====================
export interface IStockMovementRepository {
  list(tenantId: string, params: PaginationInput & { productId?: string; warehouseId?: string; type?: string }): Promise<ListResult<StockMovement>>;
  getById(id: string, tenantId: string): Promise<StockMovement | null>;
  create(tenantId: string, data: CreateMovementDTO, userId?: string): Promise<StockMovement>;
}

// ==================== Inventory Count Repository ====================
export interface IInventoryCountRepository {
  list(tenantId: string, params: PaginationInput): Promise<ListResult<InventoryCount>>;
  getById(id: string, tenantId: string): Promise<InventoryCountWithItems | null>;
  create(tenantId: string, data: CreateInventoryCountDTO, userId?: string): Promise<InventoryCount>;
  updateStatus(id: string, tenantId: string, status: string, userId?: string): Promise<InventoryCount | null>;
  addCountItem(inventoryCountId: string, data: CountItemDTO): Promise<void>;
}
