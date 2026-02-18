import { z } from 'zod';

// ==================== Orçamentos ====================

const quoteItemSchema = z.object({
  productId: z.string().uuid('ID do produto inválido'),
  quantity: z.number().int().min(1, 'Quantidade mínima é 1'),
  unitPrice: z.number().min(0, 'Preço unitário inválido'),
  discount: z.number().min(0).default(0),
  notes: z.string().optional(),
});

export const createQuoteSchema = z.object({
  clientId: z.string().uuid('ID do cliente inválido'),
  sellerId: z.string().uuid().optional(),
  date: z.string(),
  validUntil: z.string().optional(),
  discount: z.number().min(0).default(0),
  notes: z.string().optional(),
  items: z.array(quoteItemSchema).min(1, 'Orçamento deve ter pelo menos 1 item'),
});

export const updateQuoteSchema = z.object({
  clientId: z.string().uuid().optional(),
  sellerId: z.string().uuid().optional(),
  date: z.string().optional(),
  validUntil: z.string().optional(),
  discount: z.number().min(0).optional(),
  notes: z.string().optional(),
  status: z.enum(['draft', 'sent', 'approved', 'rejected', 'expired']).optional(),
  items: z.array(quoteItemSchema).optional(),
});

// ==================== Vendas ====================

const saleItemSchema = z.object({
  productId: z.string().uuid('ID do produto inválido'),
  quantity: z.number().int().min(1, 'Quantidade mínima é 1'),
  unitPrice: z.number().min(0, 'Preço unitário inválido'),
  discount: z.number().min(0).default(0),
});

export const createSaleSchema = z.object({
  quoteId: z.string().uuid().optional(),
  clientId: z.string().uuid('ID do cliente inválido'),
  sellerId: z.string().uuid().optional(),
  date: z.string(),
  discount: z.number().min(0).default(0),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(saleItemSchema).min(1, 'Venda deve ter pelo menos 1 item'),
});

export const updateSaleSchema = z.object({
  clientId: z.string().uuid().optional(),
  sellerId: z.string().uuid().optional(),
  date: z.string().optional(),
  discount: z.number().min(0).optional(),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['pending', 'confirmed', 'invoiced', 'cancelled']).optional(),
});

// ==================== Devoluções ====================

const returnItemSchema = z.object({
  saleItemId: z.string().uuid().optional(),
  productId: z.string().uuid('ID do produto inválido'),
  quantity: z.number().int().min(1, 'Quantidade mínima é 1'),
  unitPrice: z.number().min(0, 'Preço unitário inválido'),
  reason: z.string().optional(),
});

export const createReturnSchema = z.object({
  saleId: z.string().uuid('ID da venda inválido'),
  clientId: z.string().uuid('ID do cliente inválido'),
  date: z.string(),
  reason: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(returnItemSchema).min(1, 'Devolução deve ter pelo menos 1 item'),
});

export const updateReturnSchema = z.object({
  reason: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'completed']).optional(),
});

export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;
export type UpdateQuoteInput = z.infer<typeof updateQuoteSchema>;
export type CreateSaleInput = z.infer<typeof createSaleSchema>;
export type UpdateSaleInput = z.infer<typeof updateSaleSchema>;
export type CreateReturnInput = z.infer<typeof createReturnSchema>;
export type UpdateReturnInput = z.infer<typeof updateReturnSchema>;
