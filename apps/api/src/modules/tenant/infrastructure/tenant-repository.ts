import { eq } from 'drizzle-orm';
import type { ITenantRepository } from '../domain/repositories';
import type { Tenant, CreateTenantDTO } from '../domain/entities';
import type { DatabaseConnection } from '../../../shared/database/connection';
import { tenants } from './schema';

export class TenantRepository implements ITenantRepository {
  constructor(private db: DatabaseConnection) {}

  async create(data: CreateTenantDTO): Promise<Tenant> {
    const newTenant = {
      id: crypto.randomUUID(),
      name: data.name,
      subdomain: data.subdomain,
      status: 'active' as const,
      plan: data.plan || ('free' as const),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.db.insert(tenants).values(newTenant as any);
    return newTenant;
  }

  async findById(id: string): Promise<Tenant | null> {
    const result = await this.db
      .select()
      .from(tenants)
      .where(eq(tenants.id, id))
      .limit(1);
    return result[0] || null;
  }

  async findBySubdomain(subdomain: string): Promise<Tenant | null> {
    const result = await this.db
      .select()
      .from(tenants)
      .where(eq(tenants.subdomain, subdomain))
      .limit(1);
    return result[0] || null;
  }

  async update(id: string, data: Partial<Tenant>): Promise<Tenant> {
    await this.db
      .update(tenants)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tenants.id, id));

    const updated = await this.findById(id);
    if (!updated) throw new Error('Tenant not found after update');
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(tenants).where(eq(tenants.id, id));
  }

  async list(limit = 50, offset = 0): Promise<Tenant[]> {
    return await this.db.select().from(tenants).limit(limit).offset(offset);
  }
}
