import type { PaginationInput } from '@erp/shared';
import type {
  Category,
  CreateCategoryDTO,
  UpdateCategoryDTO,
  Product,
  CreateProductDTO,
  UpdateProductDTO,
} from './entities';

export interface ListResult<T> {
  data: T[];
  total: number;
}

// ==================== Category Repository ====================

export interface ICategoryRepository {
  list(tenantId: string, params: PaginationInput): Promise<ListResult<Category>>;
  getById(id: string, tenantId: string): Promise<Category | null>;
  create(tenantId: string, data: CreateCategoryDTO): Promise<Category>;
  update(id: string, tenantId: string, data: UpdateCategoryDTO): Promise<Category>;
  softDelete(id: string, tenantId: string): Promise<void>;
}

// ==================== Product Repository ====================

export interface IProductRepository {
  list(tenantId: string, params: PaginationInput): Promise<ListResult<Product>>;
  getById(id: string, tenantId: string): Promise<Product | null>;
  create(tenantId: string, data: CreateProductDTO): Promise<Product>;
  update(id: string, tenantId: string, data: UpdateProductDTO): Promise<Product>;
  softDelete(id: string, tenantId: string): Promise<void>;
}
