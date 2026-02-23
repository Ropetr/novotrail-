// ==================== Orçamentos ====================

export type QuoteStatus = 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';

export interface Quote {
  id: string;
  tenantId: string;
  number: string;
  clientId: string;
  sellerId?: string;
  date: string;
  validUntil?: string;
  status: QuoteStatus;
  subtotal: number;
  discount: number;
  total: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuoteItem {
  id: string;
  quoteId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  notes?: string;
}

export interface CreateQuoteDTO {
  clientId: string;
  sellerId?: string;
  date: string;
  validUntil?: string;
  discount?: number;
  notes?: string;
  items: CreateQuoteItemDTO[];
}

export interface CreateQuoteItemDTO {
  productId: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  notes?: string;
}

export interface UpdateQuoteDTO extends Partial<Omit<CreateQuoteDTO, 'items'>> {
  status?: QuoteStatus;
  items?: CreateQuoteItemDTO[];
}

// ==================== Vendas ====================

export type SaleStatus = 'pending' | 'confirmed' | 'invoiced' | 'cancelled';

export interface Sale {
  id: string;
  tenantId: string;
  number: string;
  quoteId?: string;
  clientId: string;
  sellerId?: string;
  date: string;
  status: SaleStatus;
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface CreateSaleDTO {
  quoteId?: string;
  clientId: string;
  sellerId?: string;
  date: string;
  discount?: number;
  paymentMethod?: string;
  notes?: string;
  items: CreateSaleItemDTO[];
}

export interface CreateSaleItemDTO {
  productId: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
}

export interface UpdateSaleDTO extends Partial<Omit<CreateSaleDTO, 'items'>> {
  status?: SaleStatus;
}

// ==================== Devoluções ====================

export type ReturnStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface Return {
  id: string;
  tenantId: string;
  number: string;
  saleId: string;
  clientId: string;
  date: string;
  status: ReturnStatus;
  reason?: string;
  subtotal: number;
  total: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReturnItem {
  id: string;
  returnId: string;
  saleItemId?: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  total: number;
  reason?: string;
}

export interface CreateReturnDTO {
  saleId: string;
  clientId: string;
  date: string;
  reason?: string;
  notes?: string;
  items: CreateReturnItemDTO[];
}

export interface CreateReturnItemDTO {
  saleItemId?: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  reason?: string;
}

export interface UpdateReturnDTO extends Partial<Omit<CreateReturnDTO, 'items'>> {
  status?: ReturnStatus;
}
