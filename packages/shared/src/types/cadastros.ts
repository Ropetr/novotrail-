import type { EntityStatus, PersonType } from './common';

// ==================== Clientes ====================

export interface Client {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  tradeName?: string;
  type: PersonType;
  document: string;
  rg?: string;
  stateRegistration?: string;
  email: string;
  phone: string;
  cellphone?: string;
  zipCode?: string;
  address?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city: string;
  state: string;
  status: EntityStatus;
  creditLimit: number;
  balance: number;
  lastPurchase?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateClientDTO {
  code?: string;
  name: string;
  tradeName?: string;
  type: PersonType;
  document: string;
  rg?: string;
  stateRegistration?: string;
  email: string;
  phone: string;
  cellphone?: string;
  zipCode?: string;
  address?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city: string;
  state: string;
  creditLimit?: number;
  notes?: string;
}

export interface UpdateClientDTO extends Partial<CreateClientDTO> {
  status?: EntityStatus;
}

// ==================== Fornecedores ====================

export interface Supplier {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  tradeName?: string;
  type: PersonType;
  document: string;
  stateRegistration?: string;
  email: string;
  phone: string;
  cellphone?: string;
  zipCode?: string;
  address?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city: string;
  state: string;
  status: EntityStatus;
  paymentTerms?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSupplierDTO {
  code?: string;
  name: string;
  tradeName?: string;
  type: PersonType;
  document: string;
  stateRegistration?: string;
  email: string;
  phone: string;
  cellphone?: string;
  zipCode?: string;
  address?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city: string;
  state: string;
  paymentTerms?: string;
  notes?: string;
}

export interface UpdateSupplierDTO extends Partial<CreateSupplierDTO> {
  status?: EntityStatus;
}

// ==================== Parceiros ====================

export interface Partner {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  tradeName?: string;
  type: PersonType;
  document: string;
  email: string;
  phone: string;
  cellphone?: string;
  city: string;
  state: string;
  status: EntityStatus;
  commissionRate?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePartnerDTO {
  code?: string;
  name: string;
  tradeName?: string;
  type: PersonType;
  document: string;
  email: string;
  phone: string;
  cellphone?: string;
  city: string;
  state: string;
  commissionRate?: number;
  notes?: string;
}

export interface UpdatePartnerDTO extends Partial<CreatePartnerDTO> {
  status?: EntityStatus;
}

// ==================== Colaboradores ====================

export interface Employee {
  id: string;
  tenantId: string;
  userId?: string;
  code: string;
  name: string;
  document: string;
  email: string;
  phone: string;
  department?: string;
  position?: string;
  hireDate?: string;
  status: EntityStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEmployeeDTO {
  userId?: string;
  code?: string;
  name: string;
  document: string;
  email: string;
  phone: string;
  department?: string;
  position?: string;
  hireDate?: string;
  notes?: string;
}

export interface UpdateEmployeeDTO extends Partial<CreateEmployeeDTO> {
  status?: EntityStatus;
}
