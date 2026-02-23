import type { EntityStatus } from './common';

// ==================== Categorias ====================

export interface Category {
  id: string;
  tenantId: string;
  name: string;
  parentId?: string;
  status: EntityStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryDTO {
  name: string;
  parentId?: string;
}

export interface UpdateCategoryDTO extends Partial<CreateCategoryDTO> {
  status?: EntityStatus;
}

// ==================== Produtos ====================

export interface Product {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  description?: string;
  categoryId?: string;
  sku?: string;
  barcode?: string;
  unit: string;
  costPrice: number;
  salePrice: number;
  status: EntityStatus;
  minStock: number;
  currentStock: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductDTO {
  code?: string;
  name: string;
  description?: string;
  categoryId?: string;
  sku?: string;
  barcode?: string;
  unit: string;
  costPrice: number;
  salePrice: number;
  minStock?: number;
  notes?: string;
}

export interface UpdateProductDTO extends Partial<CreateProductDTO> {
  status?: EntityStatus;
  currentStock?: number;
}
