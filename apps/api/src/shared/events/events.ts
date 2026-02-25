/** Domain event types for cross-module communication */

export type DomainEventType =
  // Comercial events
  | 'quote.approved'
  | 'quote.converted_to_sale'
  | 'sale.created'
  | 'sale.confirmed'
  | 'sale.cancelled'
  | 'return.created'
  | 'return.approved'
  // Cadastros events
  | 'client.created'
  | 'client.updated'
  | 'supplier.created'
  | 'product.stock_low'
  // Estoque events
  | 'stock.movement_created'
  | 'stock.transfer_shipped'
  | 'stock.transfer_received'
  | 'stock.inventory_approved'
  | 'stock.low_alert';

export interface DomainEvent<T = unknown> {
  type: DomainEventType;
  tenantId: string;
  payload: T;
  metadata: {
    timestamp: string;
    userId: string;
    correlationId?: string;
  };
}

// Payload types for each event
export interface QuoteApprovedPayload {
  quoteId: string;
  clientId: string;
  total: number;
}

export interface SaleCreatedPayload {
  saleId: string;
  quoteId?: string;
  clientId: string;
  total: number;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}

export interface SaleCancelledPayload {
  saleId: string;
  clientId: string;
  total: number;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}

export interface ReturnApprovedPayload {
  returnId: string;
  saleId: string;
  clientId: string;
  total: number;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}

export interface StockLowPayload {
  productId: string;
  productName: string;
  currentStock: number;
  minStock: number;
}

// ==================== Stock Event Payloads ====================

export interface StockMovementCreatedPayload {
  movementId: string;
  productId: string;
  warehouseId: string;
  type: string;
  quantity: number;
  referenceType?: string;
  referenceId?: string;
}

export interface StockTransferShippedPayload {
  transferId: string;
  transferNumber: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  items: Array<{ productId: string; quantity: number }>;
}

export interface StockTransferReceivedPayload {
  transferId: string;
  transferNumber: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  items: Array<{ productId: string; quantity: number }>;
}

export interface StockInventoryApprovedPayload {
  inventoryCountId: string;
  inventoryNumber: string;
  warehouseId: string;
  adjustments: number;
}

export interface StockLowAlertPayload {
  productId: string;
  productName: string;
  productCode: string;
  currentQuantity: number;
  minStock: number;
  warehouseId: string;
  warehouseName: string;
}
