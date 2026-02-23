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
  // Mesclar/Desmembrar
  parentQuoteId?: string;
  mergedFrom?: string;
  version: number;
  internalNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuoteItem {
  id: string;
  quoteId: string;
  productId: string;
  sequence: number;
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
  internalNotes?: string;
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

// Mesclar Orçamentos
export interface MergeQuotesDTO {
  quoteIds: string[];
  mainClientId: string;
  duplicatePriceRule: 'lowest' | 'highest' | 'latest' | 'manual';
}

// Desmembrar Orçamento
export interface SplitQuoteDTO {
  itemIds: string[];
}

// ==================== Vendas ====================

export type SaleStatus = 'pending' | 'confirmed' | 'partial_invoiced' | 'invoiced' | 'partial_delivered' | 'delivered' | 'finished' | 'cancelled';

export type FinancialType = 'integral' | 'parent_receivable' | 'per_delivery' | 'define_later';

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
  // Desmembrar
  parentSaleId?: string;
  splitFrom?: string;
  // Financeiro flexível
  financialType: FinancialType;
  // Status granular
  invoicedAmount: number;
  deliveredAmount: number;
  receivedAmount: number;
  // Crédito
  creditUsed: number;
  creditReservedForDeliveries: boolean;
  internalNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  sequence: number;
  quantity: number;
  quantityInvoiced: number;
  quantityDelivered: number;
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
  financialType?: FinancialType;
  creditUsed?: number;
  creditReservedForDeliveries?: boolean;
  notes?: string;
  internalNotes?: string;
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

// ==================== Entregas Fracionadas ====================

export type DeliveryStatus = 'pending' | 'separating' | 'separated' | 'invoiced' | 'in_transit' | 'delivered' | 'cancelled';
export type DeliveryType = 'pickup' | 'delivery';

export interface SaleDelivery {
  id: string;
  saleId: string;
  number: string;
  sequence: number;
  status: DeliveryStatus;
  deliveryType: DeliveryType;
  scheduledDate?: string;
  separatedAt?: string;
  invoicedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  receiverName?: string;
  receiverDocument?: string;
  driverName?: string;
  vehiclePlate?: string;
  trackingCode?: string;
  productAmount: number;
  freightAmount: number;
  totalAmount: number;
  paymentMethod?: string;
  creditUsed: number;
  financialGenerated: boolean;
  notes?: string;
  items?: SaleDeliveryItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SaleDeliveryItem {
  id: string;
  deliveryId: string;
  saleItemId: string;
  productId: string;
  quantity: number;
  quantitySeparated: number;
  quantityDelivered: number;
  createdAt: Date;
}

export interface CreateDeliveryDTO {
  saleId: string;
  deliveryType?: DeliveryType;
  scheduledDate?: string;
  paymentMethod?: string;
  freightAmount?: number;
  notes?: string;
  items: CreateDeliveryItemDTO[];
}

export interface CreateDeliveryItemDTO {
  saleItemId: string;
  productId: string;
  quantity: number;
}

// ==================== Créditos do Cliente ====================

export type CreditOrigin = 'referral' | 'return' | 'bonus' | 'advance' | 'adjustment';
export type CreditStatus = 'active' | 'used' | 'expired' | 'cancelled';

export interface ClientCredit {
  id: string;
  tenantId: string;
  clientId: string;
  origin: CreditOrigin;
  originId?: string;
  description?: string;
  originalAmount: number;
  usedAmount: number;
  balance: number;
  expiresAt?: string;
  status: CreditStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientCreditMovement {
  id: string;
  creditId: string;
  type: 'use' | 'reversal';
  amount: number;
  saleId?: string;
  deliveryId?: string;
  userId?: string;
  notes?: string;
  createdAt: Date;
}

export interface CreateCreditDTO {
  clientId: string;
  origin: CreditOrigin;
  originId?: string;
  description?: string;
  amount: number;
  expiresAt?: string;
  notes?: string;
}

export interface UseCreditDTO {
  amount: number;
  saleId?: string;
  deliveryId?: string;
  notes?: string;
}

export interface ClientCreditSummary {
  totalBalance: number;
  credits: ClientCredit[];
  recentMovements: ClientCreditMovement[];
}

// ==================== Devoluções ====================

export type ReturnStatus = 'pending' | 'approved' | 'rejected' | 'completed';
export type RefundType = 'money' | 'credit' | 'decide_later';

export interface Return {
  id: string;
  tenantId: string;
  number: string;
  saleId: string;
  clientId: string;
  date: string;
  status: ReturnStatus;
  reason?: string;
  refundType?: RefundType;
  creditGeneratedId?: string;
  subtotal: number;
  total: number;
  notes?: string;
  approvedBy?: string;
  approvedAt?: string;
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
  productCondition?: 'new' | 'good' | 'damaged' | 'defective';
}

export interface CreateReturnDTO {
  saleId: string;
  clientId: string;
  date: string;
  reason?: string;
  refundType?: RefundType;
  notes?: string;
  items: CreateReturnItemDTO[];
}

export interface CreateReturnItemDTO {
  saleItemId?: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  reason?: string;
  productCondition?: 'new' | 'good' | 'damaged' | 'defective';
}

export interface UpdateReturnDTO extends Partial<Omit<CreateReturnDTO, 'items'>> {
  status?: ReturnStatus;
}
