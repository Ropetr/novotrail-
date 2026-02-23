import type { PaginationInput } from '@trailsystem/types';
import type {
  Quote,
  QuoteItem,
  CreateQuoteDTO,
  UpdateQuoteDTO,
  MergeQuotesDTO,
  SplitQuoteDTO,
  Sale,
  SaleItem,
  CreateSaleDTO,
  UpdateSaleDTO,
  SaleDelivery,
  CreateDeliveryDTO,
  ClientCredit,
  ClientCreditMovement,
  CreateCreditDTO,
  UseCreditDTO,
  ClientCreditSummary,
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
  merge(tenantId: string, data: MergeQuotesDTO): Promise<QuoteWithItems>;
  split(id: string, tenantId: string, data: SplitQuoteDTO): Promise<QuoteWithItems[]>;
}

// ==================== Sale Repository ====================

export interface ISaleRepository {
  list(tenantId: string, params: PaginationInput): Promise<ListResult<Sale>>;
  getById(id: string, tenantId: string): Promise<SaleWithItems | null>;
  create(tenantId: string, data: CreateSaleDTO): Promise<SaleWithItems>;
  update(id: string, tenantId: string, data: UpdateSaleDTO): Promise<SaleWithItems>;
  cancel(id: string, tenantId: string): Promise<Sale>;
}

// ==================== Delivery Repository ====================

export interface IDeliveryRepository {
  listBySale(saleId: string): Promise<SaleDelivery[]>;
  getById(id: string): Promise<SaleDelivery | null>;
  create(tenantId: string, data: CreateDeliveryDTO): Promise<SaleDelivery>;
  startSeparation(id: string): Promise<SaleDelivery>;
  confirmSeparation(id: string): Promise<SaleDelivery>;
  confirmDelivery(id: string, receiverName: string, receiverDocument?: string): Promise<SaleDelivery>;
  cancel(id: string): Promise<SaleDelivery>;
}

// ==================== Credit Repository ====================

export interface ICreditRepository {
  listByClient(clientId: string, tenantId: string): Promise<ClientCredit[]>;
  getById(id: string, tenantId: string): Promise<ClientCredit | null>;
  getSummary(clientId: string, tenantId: string): Promise<ClientCreditSummary>;
  create(tenantId: string, data: CreateCreditDTO): Promise<ClientCredit>;
  use(id: string, tenantId: string, data: UseCreditDTO): Promise<ClientCredit>;
  cancel(id: string, tenantId: string): Promise<ClientCredit>;
}

// ==================== Return Repository ====================

export interface IReturnRepository {
  list(tenantId: string, params: PaginationInput): Promise<ListResult<Return>>;
  getById(id: string, tenantId: string): Promise<ReturnWithItems | null>;
  create(tenantId: string, data: CreateReturnDTO): Promise<ReturnWithItems>;
  update(id: string, tenantId: string, data: UpdateReturnDTO): Promise<ReturnWithItems>;
  approve(id: string, tenantId: string): Promise<Return>;
}
