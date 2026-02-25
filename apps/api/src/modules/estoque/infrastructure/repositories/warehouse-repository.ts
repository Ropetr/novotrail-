import { eq, and, or, like, sql } from 'drizzle-orm';
import type { IWarehouseRepository, ListResult, PaginationInput } from '../../domain/repositories';
import type { Warehouse, CreateWarehouseDTO, UpdateWarehouseDTO } from '../../domain/entities';
import type { DatabaseConnection } from '../../../../shared/database/connection';
import { warehouses } from '../schema';

export class WarehouseRepository implements IWarehouseRepository {
  constructor(private db: DatabaseConnection) {}

  async list(tenantId: string, params: PaginationInput): Promise<ListResult<Warehouse>> {
    const { page, limit, search } = params;
    const offset = (page - 1) * limit;

    const baseWhere = eq(warehouses.tenantId, tenantId);
    const whereClause = search
      ? and(baseWhere, or(
          like(warehouses.name, `%${search}%`),
          like(warehouses.code, `%${search}%`)
        ))
      : baseWhere;

    const [data, countResult] = await Promise.all([
      this.db.select().from(warehouses).where(whereClause).limit(limit).offset(offset),
      this.db.select({ count: sql<number>`count(*)` }).from(warehouses).where(whereClause),
    ]);

    return { data: data as unknown as Warehouse[], total: Number(countResult[0].count) };
  }

  async getById(id: string, tenantId: string): Promise<Warehouse | null> {
    const result = await this.db.select().from(warehouses)
      .where(and(eq(warehouses.id, id), eq(warehouses.tenantId, tenantId)))
      .limit(1);
    return (result[0] as unknown as Warehouse) || null;
  }

  async create(tenantId: string, data: CreateWarehouseDTO): Promise<Warehouse> {
    // Se marcando como default, desmarcar o anterior
    if (data.isDefault) {
      await this.db.update(warehouses)
        .set({ isDefault: false })
        .where(and(eq(warehouses.tenantId, tenantId), eq(warehouses.isDefault, true)));
    }

    const result = await this.db.insert(warehouses).values({
      tenantId,
      code: data.code,
      name: data.name,
      type: data.type || 'main',
      address: data.address ?? null,
      city: data.city ?? null,
      state: data.state ?? null,
      responsible: data.responsible ?? null,
      isDefault: data.isDefault ?? false,
      notes: data.notes ?? null,
    }).returning();

    return result[0] as unknown as Warehouse;
  }

  async update(id: string, tenantId: string, data: UpdateWarehouseDTO): Promise<Warehouse> {
    if (data.isDefault) {
      await this.db.update(warehouses)
        .set({ isDefault: false })
        .where(and(eq(warehouses.tenantId, tenantId), eq(warehouses.isDefault, true)));
    }

    const result = await this.db.update(warehouses)
      .set(data as any)
      .where(and(eq(warehouses.id, id), eq(warehouses.tenantId, tenantId)))
      .returning();

    return result[0] as unknown as Warehouse;
  }

  async remove(id: string, tenantId: string): Promise<void> {
    await this.db.update(warehouses)
      .set({ isActive: false })
      .where(and(eq(warehouses.id, id), eq(warehouses.tenantId, tenantId)));
  }
}
