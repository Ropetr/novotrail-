import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export const idParamSchema = z.object({
  id: z.string().uuid('ID inválido'),
});

export const entityStatusSchema = z.enum(['active', 'inactive', 'blocked']);
export const personTypeSchema = z.enum(['pf', 'pj']);

export type PaginationInput = z.infer<typeof paginationSchema>;
export type IdParam = z.infer<typeof idParamSchema>;
