import { eq, and, sql, desc } from 'drizzle-orm';
import type { ISerialRepository, ListResult, PaginationInput } from '../../domain/repositories';
import type { StockSerial, CreateSerialDTO, SerialStatus } from '../../domain/entities';
import type { DatabaseConnection } from '../../../../shared/database/connection';
import { stockSerials, warehouses } from '../schema';
import { products } from '../../../produtos/infrastructure/schema';

export class SerialRepository implements ISerialRepository {
  constructor(private db: DatabaseConnection) {}

  async list(tenantId: string, params: PaginationInput & { productId?: string; warehouseId?: string; status?: SerialStatus }): Promise<ListResult<StockSerial>> {
    const { page, limit, productId, warehouseId, status } = params;
    const offset = (page - 1) * limit;

    const conditions: any[] = [eq(stockSerials.tenantId, tenantId)];
    if (productId) conditions.push(eq(stockSerials.productId, productId));
    if (warehouseId) conditions.push(eq(stockSerials.warehouseId, warehouseId));
    if (status) conditions.push(eq(stockSerials.status, status));
    const whereClause = and(...conditions);

    const [data, countResult] = await Promise.all([
      this.db.select({
        id: stockSerials.id,
        tenantId: stockSerials.tenantId,
        productId: stockSerials.productId,
        warehouseId: stockSerials.warehouseId,
        serialNumber: stockSerials.serialNumber,
        status: stockSerials.status,
        movementId: stockSerials.movementId,
        createdAt: stockSerials.createdAt,
        productName: products.name,
        warehouseName: warehouses.name,
      })
        .from(stockSerials)
        .innerJoin(products, eq(stockSerials.productId, products.id))
        .innerJoin(warehouses, eq(stockSerials.warehouseId, warehouses.id))
        .where(whereClause)
        .orderBy(desc(stockSerials.createdAt))
        .limit(limit)
        .offset(offset),
      this.db.select({ count: sql<number>`count(*)` }).from(stockSerials).where(whereClause),
    ]);

    return { data: data as unknown as StockSerial[], total: Number(countResult[0].count) };
  }

  async getById(id: string, tenantId: string): Promise<StockSerial | null> {
    const rows = await this.db.select()
      .from(stockSerials)
      .where(and(eq(stockSerials.id, id), eq(stockSerials.tenantId, tenantId)))
      .limit(1);
    return (rows[0] as unknown as StockSerial) || null;
  }

  async create(tenantId: string, data: CreateSerialDTO): Promise<StockSerial> {
    const [row] = await this.db.insert(stockSerials).values({
      tenantId,
      productId: data.productId,
      warehouseId: data.warehouseId,
      serialNumber: data.serialNumber,
    }).returning();
    return row as unknown as StockSerial;
  }

  async updateStatus(id: string, tenantId: string, status: SerialStatus, movementId?: string): Promise<StockSerial> {
    const updateData: Record<string, any> = { status };
    if (movementId) updateData.movementId = movementId;

    await this.db.update(stockSerials)
      .set(updateData)
      .where(and(eq(stockSerials.id, id), eq(stockSerials.tenantId, tenantId)));
    return this.getById(id, tenantId) as Promise<StockSerial>;
  }

  async getBySerialNumber(serialNumber: string, tenantId: string): Promise<StockSerial | null> {
    const rows = await this.db.select()
      .from(stockSerials)
      .where(and(eq(stockSerials.serialNumber, serialNumber), eq(stockSerials.tenantId, tenantId)))
      .limit(1);
    return (rows[0] as unknown as StockSerial) || null;
  }
}
