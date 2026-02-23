import type { PaginationInput } from '@trailsystem/types';
import type {
  Client,
  CreateClientDTO,
  UpdateClientDTO,
  Supplier,
  CreateSupplierDTO,
  UpdateSupplierDTO,
  Partner,
  CreatePartnerDTO,
  UpdatePartnerDTO,
  Employee,
  CreateEmployeeDTO,
  UpdateEmployeeDTO,
} from './entities';

export interface ListResult<T> {
  data: T[];
  total: number;
}

// ==================== Client Repository ====================

export interface IClientRepository {
  list(tenantId: string, params: PaginationInput): Promise<ListResult<Client>>;
  getById(id: string, tenantId: string): Promise<Client | null>;
  create(tenantId: string, data: CreateClientDTO): Promise<Client>;
  update(id: string, tenantId: string, data: UpdateClientDTO): Promise<Client>;
  softDelete(id: string, tenantId: string): Promise<void>;
}

// ==================== Supplier Repository ====================

export interface ISupplierRepository {
  list(tenantId: string, params: PaginationInput): Promise<ListResult<Supplier>>;
  getById(id: string, tenantId: string): Promise<Supplier | null>;
  create(tenantId: string, data: CreateSupplierDTO): Promise<Supplier>;
  update(id: string, tenantId: string, data: UpdateSupplierDTO): Promise<Supplier>;
  softDelete(id: string, tenantId: string): Promise<void>;
}

// ==================== Partner Repository ====================

export interface IPartnerRepository {
  list(tenantId: string, params: PaginationInput): Promise<ListResult<Partner>>;
  getById(id: string, tenantId: string): Promise<Partner | null>;
  create(tenantId: string, data: CreatePartnerDTO): Promise<Partner>;
  update(id: string, tenantId: string, data: UpdatePartnerDTO): Promise<Partner>;
  softDelete(id: string, tenantId: string): Promise<void>;
}

// ==================== Employee Repository ====================

export interface IEmployeeRepository {
  list(tenantId: string, params: PaginationInput): Promise<ListResult<Employee>>;
  getById(id: string, tenantId: string): Promise<Employee | null>;
  create(tenantId: string, data: CreateEmployeeDTO): Promise<Employee>;
  update(id: string, tenantId: string, data: UpdateEmployeeDTO): Promise<Employee>;
  softDelete(id: string, tenantId: string): Promise<void>;
}
