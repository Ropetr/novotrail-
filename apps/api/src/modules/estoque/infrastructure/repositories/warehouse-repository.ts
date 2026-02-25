import { eq, and, or, like, sql } from 'drizzle-orm';
import type {
  IWarehouseRepository,
  ListResult,
} from '../../domain/repositories';
import type {
  Warehouse,
  CreateWarehouseDTO,
  UpdateWarehouseDTO,
} from '../../domain/entities';
import type { DatabaseConnection } from '../../../../shared/database/connection';
import type { PaginationInput } from '@trailsystem/types';
import { warehouses } from '../schema';

export class WarehouseRepository implements IWarehouseRepository {
  constructor(private db: DatabaseConnection) {}

  async list(tenantId: string, params: PaginationInput): Promise<ListResult<Warehouse>> {
    const { page, limit, search } = params;
    const offset = (page - 1) * limit;
    const baseWhere = eq(warehouses.tenantId, tenantId);
    const whereClause = search
      ? and(baseWhere, or(like(warehouses.name, `%${search}%`), like(warehouses.code, `%${search}%`)))
      : baseWhere;

    const [data, countResult] = await Promise.all([
      this.db.select().from(warehouses).where(whereClause).limit(limit).offset(offset),
      this.db.select({ count: sql<number>`count(*)` }).from(warehouses).where(whereClause),
    ]);

    return {
      data: data as unknown as Warehouse[],
      total: Number(countResult[0].count),
    };
  }

  async getById(id: string, tenantId: string): Promise<Warehouse | null> {
    const result = await this.db
      .select()
      .from(warehouses)
      .where(and(eq(warehouses.id, id), eq(warehouses.tenantId, tenantId)))
      .limit(1);
    return (result[0] as unknown as Warehouse) || null;
  }

  async create(tenantId: string, data: CreateWarehouseDTO): Promise<Warehouse> {
    const result = await this.db
      .insert(warehouses)
      .values({ ...data, tenantId })
      .returning();
    return result[0] as unknown as Warehouse;
  }

  async update(id: string, tenantId: string, data: UpdateWarehouseDTO): Promise<Warehouse | null> {
    const result = await this.db
      .update(warehouses)
      .set(data)
      .where(and(eq(warehouses.id, id), eq(warehouses.tenantId, tenantId)))
      .returning();
    return (result[0] as unknown as Warehouse) || null;
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    const result = await this.db
      .delete(warehouses)
      .where(and(eq(warehouses.id, id), eq(warehouses.tenantId, tenantId)))
      .returning();
    return result.length > 0;
  }
}
