import type { PaginationInput } from '@erp/shared';
import type {
  Quote,
  QuoteItem,
  CreateQuoteDTO,
  UpdateQuoteDTO,
  Sale,
  SaleItem,
  CreateSaleDTO,
  UpdateSaleDTO,
  Return,
  ReturnItem,
  CreateReturnDTO,
  UpdateReturnDTO,
} from './entities';

export interface ListResult<T> {
  data: T[];
  total: number;
}

export interface QuoteWithItems extends Quote {
  items: QuoteItem[];
}

export interface SaleWithItems extends Sale {
  items: SaleItem[];
}

export interface ReturnWithItems extends Return {
  items: ReturnItem[];
}

// ==================== Quote Repository ====================

export interface IQuoteRepository {
  list(tenantId: string, params: PaginationInput): Promise<ListResult<Quote>>;
  getById(id: string, tenantId: string): Promise<QuoteWithItems | null>;
  create(tenantId: string, data: CreateQuoteDTO): Promise<QuoteWithItems>;
  update(id: string, tenantId: string, data: UpdateQuoteDTO): Promise<QuoteWithItems>;
  approve(id: string, tenantId: string): Promise<Quote>;
  convertToSale(id: string, tenantId: string): Promise<Sale>;
  softDelete(id: string, tenantId: string): Promise<void>;
}

// ==================== Sale Repository ====================

export interface ISaleRepository {
  list(tenantId: string, params: PaginationInput): Promise<ListResult<Sale>>;
  getById(id: string, tenantId: string): Promise<SaleWithItems | null>;
  create(tenantId: string, data: CreateSaleDTO): Promise<SaleWithItems>;
  update(id: string, tenantId: string, data: UpdateSaleDTO): Promise<SaleWithItems>;
  cancel(id: string, tenantId: string): Promise<Sale>;
}

// ==================== Return Repository ====================

export interface IReturnRepository {
  list(tenantId: string, params: PaginationInput): Promise<ListResult<Return>>;
  getById(id: string, tenantId: string): Promise<ReturnWithItems | null>;
  create(tenantId: string, data: CreateReturnDTO): Promise<ReturnWithItems>;
  update(id: string, tenantId: string, data: UpdateReturnDTO): Promise<ReturnWithItems>;
  approve(id: string, tenantId: string): Promise<Return>;
}
