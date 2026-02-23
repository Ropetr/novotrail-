import { z } from 'zod';
import { entityStatusSchema, personTypeSchema } from './common';

export const createClientSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  tradeName: z.string().optional(),
  type: personTypeSchema,
  document: z.string().min(11, 'Documento inválido'),
  rg: z.string().optional(),
  stateRegistration: z.string().optional(),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  cellphone: z.string().optional(),
  zipCode: z.string().optional(),
  address: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().min(2, 'Cidade é obrigatória'),
  state: z.string().length(2, 'UF inválida'),
  creditLimit: z.number().min(0).optional(),
  notes: z.string().optional(),
});

export const updateClientSchema = createClientSchema.partial().extend({
  status: entityStatusSchema.optional(),
});

export const createSupplierSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  tradeName: z.string().optional(),
  type: personTypeSchema,
  document: z.string().min(11, 'Documento inválido'),
  stateRegistration: z.string().optional(),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  cellphone: z.string().optional(),
  zipCode: z.string().optional(),
  address: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().min(2, 'Cidade é obrigatória'),
  state: z.string().length(2, 'UF inválida'),
  paymentTerms: z.string().optional(),
  notes: z.string().optional(),
});

export const updateSupplierSchema = createSupplierSchema.partial().extend({
  status: entityStatusSchema.optional(),
});

export const createPartnerSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  tradeName: z.string().optional(),
  type: personTypeSchema,
  document: z.string().min(11, 'Documento inválido'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  cellphone: z.string().optional(),
  city: z.string().min(2, 'Cidade é obrigatória'),
  state: z.string().length(2, 'UF inválida'),
  commissionRate: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
});

export const updatePartnerSchema = createPartnerSchema.partial().extend({
  status: entityStatusSchema.optional(),
});

export const createEmployeeSchema = z.object({
  userId: z.string().uuid().optional(),
  code: z.string().optional(),
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  document: z.string().min(11, 'Documento inválido'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  department: z.string().optional(),
  position: z.string().optional(),
  hireDate: z.string().optional(),
  notes: z.string().optional(),
});

export const updateEmployeeSchema = createEmployeeSchema.partial().extend({
  status: entityStatusSchema.optional(),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;
export type CreatePartnerInput = z.infer<typeof createPartnerSchema>;
export type UpdatePartnerInput = z.infer<typeof updatePartnerSchema>;
export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
