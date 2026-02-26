import { eq, and, sql, asc, lte } from 'drizzle-orm';
import type { IBatchRepository, ListResult, PaginationInput } from '../../domain/repositories';
import type { StockBatch, CreateBatchDTO } from '../../domain/entities';
import type { DatabaseConnection } from '../../../../shared/database/connection';
import { stockBatches } from '../schema';
import { products } from '../../../produtos/infrastructure/schema';
import { warehouses } from '../schema';

export class BatchRepository implements IBatchRepository {
  constructor(private db: DatabaseConnection) {}

  async list(tenantId: string, params: PaginationInput & { productId?: string; warehouseId?: string; expiredOnly?: boolean }): Promise<ListResult<StockBatch>> {
    const { page, limit, productId, warehouseId, expiredOnly } = params;
    const offset = (page - 1) * limit;

    const conditions: any[] = [eq(stockBatches.tenantId, tenantId)];
    if (productId) conditions.push(eq(stockBatches.productId, productId));
    if (warehouseId) conditions.push(eq(stockBatches.warehouseId, warehouseId));
    if (expiredOnly) {
      conditions.push(lte(stockBatches.expirationDate, sql`CURRENT_DATE`));
    }
    const whereClause = and(...conditions);

    const [data, countResult] = await Promise.all([
      this.db.select({
        id: stockBatches.id,
        tenantId: stockBatches.tenantId,
        productId: stockBatches.productId,
        warehouseId: stockBatches.warehouseId,
        batchCode: stockBatches.batchCode,
        expirationDate: stockBatches.expirationDate,
        quantity: stockBatches.quantity,
        notes: stockBatches.notes,
        createdAt: stockBatches.createdAt,
        productName: products.name,
        warehouseName: warehouses.name,
      })
        .from(stockBatches)
        .innerJoin(products, eq(stockBatches.productId, products.id))
        .innerJoin(warehouses, eq(stockBatches.warehouseId, warehouses.id))
        .where(whereClause)
        .orderBy(asc(stockBatches.expirationDate))
        .limit(limit)
        .offset(offset),
      this.db.select({ count: sql<number>`count(*)` }).from(stockBatches).where(whereClause),
    ]);

    // Mark expired
    const today = new Date().toISOString().split('T')[0];
    const mapped = data.map(b => ({
      ...b,
      isExpired: b.expirationDate ? b.expirationDate <= today : false,
    }));

    return { data: mapped as unknown as StockBatch[], total: Number(countResult[0].count) };
  }

  async getById(id: string, tenantId: string): Promise<StockBatch | null> {
    const rows = await this.db.select()
      .from(stockBatches)
      .where(and(eq(stockBatches.id, id), eq(stockBatches.tenantId, tenantId)))
      .limit(1);
    if (!rows[0]) return null;
    const today = new Date().toISOString().split('T')[0];
    return { ...rows[0], isExpired: rows[0].expirationDate ? rows[0].expirationDate <= today : false } as unknown as StockBatch;
  }

  async create(tenantId: string, data: CreateBatchDTO): Promise<StockBatch> {
    const [row] = await this.db.insert(stockBatches).values({
      tenantId,
      productId: data.productId,
      warehouseId: data.warehouseId,
      batchCode: data.batchCode,
      expirationDate: data.expirationDate || null,
      quantity: String(data.quantity),
      notes: data.notes,
    }).returning();
    return row as unknown as StockBatch;
  }

  async updateQuantity(id: string, tenantId: string, quantityDelta: number): Promise<StockBatch> {
    await this.db.execute(
      sql`UPDATE stock_batches SET quantity = quantity + ${quantityDelta} WHERE id = ${id} AND tenant_id = ${tenantId}`
    );
    return this.getById(id, tenantId) as Promise<StockBatch>;
  }

  async getFifo(productId: string, warehouseId: string, tenantId: string): Promise<StockBatch[]> {
    const rows = await this.db.select()
      .from(stockBatches)
      .where(and(
        eq(stockBatches.productId, productId),
        eq(stockBatches.warehouseId, warehouseId),
        eq(stockBatches.tenantId, tenantId),
        sql`${stockBatches.quantity} > 0`
      ))
      .orderBy(asc(stockBatches.expirationDate), asc(stockBatches.createdAt));
    return rows as unknown as StockBatch[];
  }
}
