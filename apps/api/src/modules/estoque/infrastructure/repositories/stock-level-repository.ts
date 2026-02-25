import { eq, and, sql, lt } from 'drizzle-orm';
import type {
  IStockLevelRepository,
  ListResult,
} from '../../domain/repositories';
import type {
  StockLevel,
  StockLevelWithDetails,
} from '../../domain/entities';
import type { DatabaseConnection } from '../../../../shared/database/connection';
import type { PaginationInput } from '@trailsystem/types';
import { stockLevels } from '../schema';
import { products } from '../../../produtos/infrastructure/schema';
import { warehouses } from '../schema';

export class StockLevelRepository implements IStockLevelRepository {
  constructor(private db: DatabaseConnection) {}

  async list(
    tenantId: string,
    params: PaginationInput & { warehouseId?: string }
  ): Promise<ListResult<StockLevelWithDetails>> {
    const { page, limit, warehouseId } = params;
    const offset = (page - 1) * limit;

    const conditions = [eq(stockLevels.tenantId, tenantId)];
    if (warehouseId) {
      conditions.push(eq(stockLevels.warehouseId, warehouseId));
    }
    const whereClause = and(...conditions);

    const [data, countResult] = await Promise.all([
      this.db
        .select({
          id: stockLevels.id,
          tenantId: stockLevels.tenantId,
          productId: stockLevels.productId,
          warehouseId: stockLevels.warehouseId,
          quantity: stockLevels.quantity,
          reservedQty: stockLevels.reservedQty,
          averageCost: stockLevels.averageCost,
          lastPurchaseCost: stockLevels.lastPurchaseCost,
          minStock: stockLevels.minStock,
          maxStock: stockLevels.maxStock,
          updatedAt: stockLevels.updatedAt,
          productName: products.name,
          productSku: products.sku,
          warehouseName: warehouses.name,
        })
        .from(stockLevels)
        .innerJoin(products, eq(stockLevels.productId, products.id))
        .innerJoin(warehouses, eq(stockLevels.warehouseId, warehouses.id))
        .where(whereClause)
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(stockLevels)
        .where(whereClause),
    ]);

    return {
      data: data.map((row) => ({
        ...row,
        available: Number(row.quantity) - Number(row.reservedQty),
      })) as unknown as StockLevelWithDetails[],
      total: Number(countResult[0].count),
    };
  }

  async getByProduct(
    productId: string,
    tenantId: string,
    warehouseId?: string
  ): Promise<StockLevel[]> {
    const conditions = [
      eq(stockLevels.tenantId, tenantId),
      eq(stockLevels.productId, productId),
    ];
    if (warehouseId) {
      conditions.push(eq(stockLevels.warehouseId, warehouseId));
    }

    const result = await this.db
      .select()
      .from(stockLevels)
      .where(and(...conditions));

    return result as unknown as StockLevel[];
  }

  async getAlerts(
    tenantId: string,
    warehouseId?: string
  ): Promise<StockLevelWithDetails[]> {
    const conditions = [
      eq(stockLevels.tenantId, tenantId),
      sql`(${stockLevels.quantity}::numeric - ${stockLevels.reservedQty}::numeric) <= ${stockLevels.minStock}::numeric`,
    ];
    if (warehouseId) {
      conditions.push(eq(stockLevels.warehouseId, warehouseId));
    }

    const data = await this.db
      .select({
        id: stockLevels.id,
        tenantId: stockLevels.tenantId,
        productId: stockLevels.productId,
        warehouseId: stockLevels.warehouseId,
        quantity: stockLevels.quantity,
        reservedQty: stockLevels.reservedQty,
        averageCost: stockLevels.averageCost,
        lastPurchaseCost: stockLevels.lastPurchaseCost,
        minStock: stockLevels.minStock,
        maxStock: stockLevels.maxStock,
        updatedAt: stockLevels.updatedAt,
        productName: products.name,
        productSku: products.sku,
        warehouseName: warehouses.name,
      })
      .from(stockLevels)
      .innerJoin(products, eq(stockLevels.productId, products.id))
      .innerJoin(warehouses, eq(stockLevels.warehouseId, warehouses.id))
      .where(and(...conditions));

    return data.map((row) => ({
      ...row,
      available: Number(row.quantity) - Number(row.reservedQty),
    })) as unknown as StockLevelWithDetails[];
  }

  async upsert(
    tenantId: string,
    productId: string,
    warehouseId: string,
    updates: Partial<StockLevel>
  ): Promise<StockLevel> {
    const existing = await this.db
      .select()
      .from(stockLevels)
      .where(
        and(
          eq(stockLevels.tenantId, tenantId),
          eq(stockLevels.productId, productId),
          eq(stockLevels.warehouseId, warehouseId)
        )
      )
      .limit(1);

    if (existing[0]) {
      const result = await this.db
        .update(stockLevels)
        .set(updates)
        .where(eq(stockLevels.id, existing[0].id))
        .returning();
      return result[0] as unknown as StockLevel;
    }

    const result = await this.db
      .insert(stockLevels)
      .values({
        tenantId,
        productId,
        warehouseId,
        quantity: updates.quantity || '0',
        reservedQty: updates.reservedQty || '0',
        averageCost: updates.averageCost || '0',
        lastPurchaseCost: updates.lastPurchaseCost,
        minStock: updates.minStock,
        maxStock: updates.maxStock,
      })
      .returning();
    return result[0] as unknown as StockLevel;
  }
}
