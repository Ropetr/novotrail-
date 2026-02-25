import { eq, and, sql, lt } from 'drizzle-orm';
import type { IStockLevelRepository, ListResult, PaginationInput } from '../../domain/repositories';
import type { StockLevel, StockDashboard } from '../../domain/entities';
import type { DatabaseConnection } from '../../../../shared/database/connection';
import { stockLevels } from '../schema';
import { products } from '../../../produtos/infrastructure/schema';
import { warehouses } from '../schema';
import { stockMovements } from '../schema';

export class StockLevelRepository implements IStockLevelRepository {
  constructor(private db: DatabaseConnection) {}

  async list(tenantId: string, params: PaginationInput & {
    warehouseId?: string;
    lowStockOnly?: boolean;
  }): Promise<ListResult<StockLevel>> {
    const { page, limit, search, warehouseId, lowStockOnly } = params;
    const offset = (page - 1) * limit;

    const conditions: any[] = [eq(stockLevels.tenantId, tenantId)];
    if (warehouseId) conditions.push(eq(stockLevels.warehouseId, warehouseId));

    const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions);

    const [data, countResult] = await Promise.all([
      this.db.select().from(stockLevels).where(whereClause).limit(limit).offset(offset),
      this.db.select({ count: sql<number>`count(*)` }).from(stockLevels).where(whereClause),
    ]);

    return { data: data as unknown as StockLevel[], total: Number(countResult[0].count) };
  }

  async getByProduct(productId: string, tenantId: string): Promise<StockLevel[]> {
    const result = await this.db.select().from(stockLevels)
      .where(and(eq(stockLevels.productId, productId), eq(stockLevels.tenantId, tenantId)));
    return result as unknown as StockLevel[];
  }

  async getOrCreate(tenantId: string, productId: string, warehouseId: string): Promise<StockLevel> {
    const existing = await this.db.select().from(stockLevels)
      .where(and(
        eq(stockLevels.tenantId, tenantId),
        eq(stockLevels.productId, productId),
        eq(stockLevels.warehouseId, warehouseId),
      ))
      .limit(1);

    if (existing[0]) return existing[0] as unknown as StockLevel;

    const result = await this.db.insert(stockLevels).values({
      tenantId,
      productId,
      warehouseId,
      quantity: '0',
      reservedQuantity: '0',
      availableQuantity: '0',
      averageCost: '0',
    }).returning();

    return result[0] as unknown as StockLevel;
  }

  async updateLevel(id: string, quantity: string, averageCost: string): Promise<StockLevel> {
    const currentLevel = await this.db.select().from(stockLevels)
      .where(eq(stockLevels.id, id)).limit(1);

    const reserved = currentLevel[0]?.reservedQuantity ?? '0';
    const available = String(Number(quantity) - Number(reserved));

    const result = await this.db.update(stockLevels).set({
      quantity,
      availableQuantity: available,
      averageCost,
      lastMovementAt: new Date(),
    }).where(eq(stockLevels.id, id)).returning();

    return result[0] as unknown as StockLevel;
  }

  async getDashboard(tenantId: string): Promise<StockDashboard> {
    // Total de produtos com estoque
    const totalProductsResult = await this.db
      .select({ count: sql<number>`count(distinct ${stockLevels.productId})` })
      .from(stockLevels)
      .where(eq(stockLevels.tenantId, tenantId));

    // Total de depósitos ativos
    const totalWarehousesResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(warehouses)
      .where(and(eq(warehouses.tenantId, tenantId), eq(warehouses.isActive, true)));

    // Valor total em estoque
    const totalValueResult = await this.db
      .select({
        total: sql<number>`coalesce(sum(cast(${stockLevels.quantity} as numeric) * cast(${stockLevels.averageCost} as numeric)), 0)`,
      })
      .from(stockLevels)
      .where(eq(stockLevels.tenantId, tenantId));

    // Alertas de estoque baixo (stock_levels.quantity < products.minStock)
    const lowStockResult = await this.db
      .select({
        productId: stockLevels.productId,
        productName: products.name,
        productCode: products.code,
        currentQuantity: stockLevels.quantity,
        minStock: products.minStock,
        warehouseId: stockLevels.warehouseId,
        warehouseName: warehouses.name,
      })
      .from(stockLevels)
      .innerJoin(products, eq(stockLevels.productId, products.id))
      .innerJoin(warehouses, eq(stockLevels.warehouseId, warehouses.id))
      .where(and(
        eq(stockLevels.tenantId, tenantId),
        sql`cast(${stockLevels.quantity} as numeric) < cast(${products.minStock} as numeric)`,
        sql`cast(${products.minStock} as numeric) > 0`,
      ))
      .limit(20);

    // Movimentações recentes
    const recentMovementsResult = await this.db
      .select()
      .from(stockMovements)
      .where(eq(stockMovements.tenantId, tenantId))
      .orderBy(sql`${stockMovements.createdAt} desc`)
      .limit(10);

    return {
      totalProducts: Number(totalProductsResult[0]?.count ?? 0),
      totalWarehouses: Number(totalWarehousesResult[0]?.count ?? 0),
      totalValue: Number(totalValueResult[0]?.total ?? 0),
      lowStockAlerts: lowStockResult.map((r: any) => ({
        productId: r.productId,
        productName: r.productName,
        productCode: r.productCode,
        currentQuantity: Number(r.currentQuantity),
        minStock: Number(r.minStock),
        warehouseId: r.warehouseId,
        warehouseName: r.warehouseName,
      })),
      recentMovements: recentMovementsResult as unknown as any[],
    };
  }
}
