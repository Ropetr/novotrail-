import type { Tenant, CreateTenantDTO } from './entities';

export interface ITenantRepository {
  create(data: CreateTenantDTO): Promise<Tenant>;
  findById(id: string): Promise<Tenant | null>;
  findBySubdomain(subdomain: string): Promise<Tenant | null>;
  update(id: string, data: Partial<Tenant>): Promise<Tenant>;
  delete(id: string): Promise<void>;
  list(limit?: number, offset?: number): Promise<Tenant[]>;
}
