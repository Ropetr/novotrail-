import { eq, and } from 'drizzle-orm';
import type { ICostCenterRepository } from '../../domain/repositories';
import type { CostCenter, CreateCostCenterDTO, UpdateCostCenterDTO } from '../../domain/entities';
import type { DatabaseConnection } from '../../../../shared/database/connection';
import { costCenters } from '../schema';

export class CostCenterRepository implements ICostCenterRepository {
  constructor(private db: DatabaseConnection) {}

  async list(tenantId: string): Promise<CostCenter[]> {
    const result = await this.db.select().from(costCenters)
      .where(eq(costCenters.tenantId, tenantId))
      .orderBy(costCenters.code);
    return result as unknown as CostCenter[];
  }

  async getById(id: string, tenantId: string): Promise<CostCenter | null> {
    const result = await this.db.select().from(costCenters)
      .where(and(eq(costCenters.id, id), eq(costCenters.tenantId, tenantId)))
      .limit(1);
    return (result[0] as unknown as CostCenter) || null;
  }

  async create(tenantId: string, data: CreateCostCenterDTO): Promise<CostCenter> {
    const result = await this.db.insert(costCenters).values({
      tenantId,
      code: data.code,
      name: data.name,
      parentId: data.parentId || null,
    }).returning();
    return result[0] as unknown as CostCenter;
  }

  async update(id: string, tenantId: string, data: UpdateCostCenterDTO): Promise<CostCenter | null> {
    const updates: Record<string, any> = {};
    if (data.code !== undefined) updates.code = data.code;
    if (data.name !== undefined) updates.name = data.name;
    if (data.parentId !== undefined) updates.parentId = data.parentId;
    if (data.isActive !== undefined) updates.isActive = data.isActive;

    if (Object.keys(updates).length === 0) return this.getById(id, tenantId);

    const result = await this.db.update(costCenters).set(updates)
      .where(and(eq(costCenters.id, id), eq(costCenters.tenantId, tenantId)))
      .returning();
    return (result[0] as unknown as CostCenter) || null;
  }

  async deactivate(id: string, tenantId: string): Promise<boolean> {
    const result = await this.db.update(costCenters)
      .set({ isActive: false })
      .where(and(eq(costCenters.id, id), eq(costCenters.tenantId, tenantId)))
      .returning();
    return result.length > 0;
  }
}
