import { z } from 'zod';

export const idParamSchema = z.object({
  id: z.string().uuid(),
});

// ==================== Plano de Contas ====================

export const createChartOfAccountSchema = z.object({
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(100),
  type: z.enum(['asset', 'liability', 'equity', 'revenue', 'expense']),
  parentId: z.string().uuid().optional(),
  isAnalytical: z.boolean().optional(),
});

export const updateChartOfAccountSchema = z.object({
  code: z.string().min(1).max(20).optional(),
  name: z.string().min(1).max(100).optional(),
  type: z.enum(['asset', 'liability', 'equity', 'revenue', 'expense']).optional(),
  parentId: z.string().uuid().nullable().optional(),
  isAnalytical: z.boolean().optional(),
});

// ==================== Contas Bancárias ====================

export const createBankAccountSchema = z.object({
  bankCode: z.string().min(1).max(10),
  agency: z.string().min(1).max(20),
  accountNumber: z.string().min(1).max(20),
  accountType: z.enum(['checking', 'savings', 'cash']),
  description: z.string().max(100).optional(),
  initialBalance: z.number().optional(),
});

export const updateBankAccountSchema = z.object({
  bankCode: z.string().min(1).max(10).optional(),
  agency: z.string().min(1).max(20).optional(),
  accountNumber: z.string().min(1).max(20).optional(),
  accountType: z.enum(['checking', 'savings', 'cash']).optional(),
  description: z.string().max(100).optional(),
  isActive: z.boolean().optional(),
});

// ==================== Centros de Custo ====================

export const createCostCenterSchema = z.object({
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(100),
  parentId: z.string().uuid().optional(),
});

export const updateCostCenterSchema = z.object({
  code: z.string().min(1).max(20).optional(),
  name: z.string().min(1).max(100).optional(),
  parentId: z.string().uuid().nullable().optional(),
  isActive: z.boolean().optional(),
});

// ==================== Títulos ====================

export const createTitleSchema = z.object({
  type: z.enum(['payable', 'receivable']),
  origin: z.enum(['purchase', 'sale', 'manual', 'adjustment']).optional(),
  originId: z.string().uuid().optional(),
  documentNumber: z.string().max(50).optional(),
  description: z.string().max(200).optional(),
  personId: z.string().uuid(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  value: z.number().positive(),
  costCenterId: z.string().uuid().optional(),
  accountId: z.string().uuid().optional(),
  bankAccountId: z.string().uuid().optional(),
});

export const updateTitleSchema = z.object({
  documentNumber: z.string().max(50).optional(),
  description: z.string().max(200).optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  costCenterId: z.string().uuid().nullable().optional(),
  accountId: z.string().uuid().nullable().optional(),
  bankAccountId: z.string().uuid().nullable().optional(),
});

export const settleTitleSchema = z.object({
  value: z.number().positive(),
  discount: z.number().min(0).optional(),
  interest: z.number().min(0).optional(),
  fine: z.number().min(0).optional(),
  bankAccountId: z.string().uuid(),
  settlementDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

// ==================== Movimentação Financeira ====================

export const createTransactionSchema = z.object({
  bankAccountId: z.string().uuid(),
  type: z.enum(['inflow', 'outflow', 'adjustment']),
  value: z.number().positive(),
  description: z.string().max(200).optional(),
  referenceId: z.string().uuid().optional(),
  referenceType: z.string().max(20).optional(),
  occurredAt: z.string().datetime().optional(),
});

export const createTransferSchema = z.object({
  fromBankAccountId: z.string().uuid(),
  toBankAccountId: z.string().uuid(),
  value: z.number().positive(),
  description: z.string().max(200).optional(),
  occurredAt: z.string().datetime().optional(),
});
