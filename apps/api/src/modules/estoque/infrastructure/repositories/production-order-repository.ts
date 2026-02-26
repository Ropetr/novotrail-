import { eq, and, sql, desc } from 'drizzle-orm';
import type { IProductionOrderRepository, ListResult, PaginationInput } from '../../domain/repositories';
import type { ProductionOrder, CreateProductionOrderDTO, ProductionStatus } from '../../domain/entities';
import type { DatabaseConnection } from '../../../../shared/database/connection';
import { productionOrders, productionOrderItems, productKits } from '../schema';
import { products } from '../../../produtos/infrastructure/schema';

export class ProductionOrderRepository implements IProductionOrderRepository {
  constructor(private db: DatabaseConnection) {}

  async list(tenantId: string, params: PaginationInput & { status?: string }): Promise<ListResult<ProductionOrder>> {
    const { page, limit, status } = params;
    const offset = (page - 1) * limit;

    let whereClause = eq(productionOrders.tenantId, tenantId);
    if (status) {
      whereClause = and(whereClause, eq(productionOrders.status, status as any))!;
    }

    const [data, countResult] = await Promise.all([
      this.db.select({
        id: productionOrders.id,
        tenantId: productionOrders.tenantId,
        code: productionOrders.code,
        status: productionOrders.status,
        productId: productionOrders.productId,
        quantity: productionOrders.quantity,
        warehouseId: productionOrders.warehouseId,
        notes: productionOrders.notes,
        startedAt: productionOrders.startedAt,
        finishedAt: productionOrders.finishedAt,
        userId: productionOrders.userId,
        createdAt: productionOrders.createdAt,
        updatedAt: productionOrders.updatedAt,
        productName: products.name,
      })
        .from(productionOrders)
        .innerJoin(products, eq(productionOrders.productId, products.id))
        .where(whereClause)
        .orderBy(desc(productionOrders.createdAt))
        .limit(limit)
        .offset(offset),
      this.db.select({ count: sql<number>`count(*)` }).from(productionOrders).where(whereClause),
    ]);

    return { data: data as unknown as ProductionOrder[], total: Number(countResult[0].count) };
  }

  async getById(id: string, tenantId: string): Promise<ProductionOrder | null> {
    const rows = await this.db.select()
      .from(productionOrders)
      .where(and(eq(productionOrders.id, id), eq(productionOrders.tenantId, tenantId)))
      .limit(1);

    if (!rows[0]) return null;

    const items = await this.db.select({
      id: productionOrderItems.id,
      productionOrderId: productionOrderItems.productionOrderId,
      productId: productionOrderItems.productId,
      quantityRequired: productionOrderItems.quantityRequired,
      quantityConsumed: productionOrderItems.quantityConsumed,
      productName: products.name,
      productCode: products.code,
    })
      .from(productionOrderItems)
      .innerJoin(products, eq(productionOrderItems.productId, products.id))
      .where(eq(productionOrderItems.productionOrderId, id));

    return { ...rows[0], items } as unknown as ProductionOrder;
  }

  async create(tenantId: string, userId: string, data: CreateProductionOrderDTO): Promise<ProductionOrder> {
    // Generate code
    const countResult = await this.db.select({ count: sql<number>`count(*)` })
      .from(productionOrders)
      .where(eq(productionOrders.tenantId, tenantId));
    const num = Number(countResult[0].count) + 1;
    const code = `OP-${String(num).padStart(5, '0')}`;

    // Create order
    const [order] = await this.db.insert(productionOrders).values({
      tenantId,
      code,
      productId: data.productId,
      quantity: String(data.quantity),
      warehouseId: data.warehouseId,
      notes: data.notes,
      userId,
    }).returning();

    // Auto-fill items from BOM
    const bomComponents = await this.db.select()
      .from(productKits)
      .where(and(
        eq(productKits.kitProductId, data.productId),
        eq(productKits.tenantId, tenantId)
      ));

    if (bomComponents.length > 0) {
      const itemInserts = bomComponents.map(c => ({
        productionOrderId: order.id,
        productId: c.componentProductId,
        quantityRequired: String(Number(c.quantity) * data.quantity),
      }));
      await this.db.insert(productionOrderItems).values(itemInserts);
    }

    return this.getById(order.id, tenantId) as Promise<ProductionOrder>;
  }

  async updateStatus(id: string, tenantId: string, status: ProductionStatus, userId: string): Promise<ProductionOrder> {
    const extra: Record<string, any> = {};
    if (status === 'in_progress') extra.startedAt = new Date();
    if (status === 'finished') extra.finishedAt = new Date();

    await this.db.update(productionOrders)
      .set({ status, ...extra })
      .where(and(eq(productionOrders.id, id), eq(productionOrders.tenantId, tenantId)));

    return this.getById(id, tenantId) as Promise<ProductionOrder>;
  }
}
