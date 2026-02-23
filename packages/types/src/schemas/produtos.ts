import { z } from 'zod';
import { entityStatusSchema } from './common';

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  parentId: z.string().uuid().optional(),
});

export const updateCategorySchema = createCategorySchema.partial().extend({
  status: entityStatusSchema.optional(),
});

export const createProductSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  description: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  unit: z.string().min(1, 'Unidade é obrigatória'),
  costPrice: z.number().min(0, 'Preço de custo inválido'),
  salePrice: z.number().min(0, 'Preço de venda inválido'),
  minStock: z.number().int().min(0).optional(),
  notes: z.string().optional(),
});

export const updateProductSchema = createProductSchema.partial().extend({
  status: entityStatusSchema.optional(),
  currentStock: z.number().int().min(0).optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
