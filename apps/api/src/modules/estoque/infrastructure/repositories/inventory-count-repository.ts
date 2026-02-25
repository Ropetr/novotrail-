import { eq, and, sql, desc } from 'drizzle-orm';
import type { IInventoryCountRepository, ListResult, PaginationInput } from '../../domain/repositories';
import type { InventoryCount, CreateInventoryCountDTO, RegisterCountItemDTO } from '../../domain/entities';
import type { DatabaseConnection } from '../../../../shared/database/connection';
import { inventoryCounts, inventoryCountItems, stockLevels } from '../schema';
import { products } from '../../../produtos/infrastructure/schema';

export class InventoryCountRepository implements IInventoryCountRepository {
  constructor(private db: DatabaseConnection) {}

  async list(tenantId: string, params: PaginationInput & {
    status?: string;
    warehouseId?: string;
  }): Promise<ListResult<InventoryCount>> {
    const { page, limit, status, warehouseId } = params;
    const offset = (page - 1) * limit;

    const conditions: any[] = [eq(inventoryCounts.tenantId, tenantId)];
    if (status) conditions.push(eq(inventoryCounts.status, status as any));
    if (warehouseId) conditions.push(eq(inventoryCounts.warehouseId, warehouseId));

    const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions);

    const [data, countResult] = await Promise.all([
      this.db.select().from(inventoryCounts)
        .where(whereClause)
        .orderBy(desc(inventoryCounts.createdAt))
        .limit(limit).offset(offset),
      this.db.select({ count: sql<number>`count(*)` })
        .from(inventoryCounts).where(whereClause),
    ]);

    return { data: data as unknown as InventoryCount[], total: Number(countResult[0].count) };
  }

  async getById(id: string, tenantId: string): Promise<InventoryCount | null> {
    const result = await this.db.select().from(inventoryCounts)
      .where(and(eq(inventoryCounts.id, id), eq(inventoryCounts.tenantId, tenantId)))
      .limit(1);

    if (!result[0]) return null;

    const items = await this.db.select().from(inventoryCountItems)
      .where(eq(inventoryCountItems.countId, id));

    return {
      ...(result[0] as any),
      items,
    } as unknown as InventoryCount;
  }

  async create(tenantId: string, userId: string, data: CreateInventoryCountDTO): Promise<InventoryCount> {
    // Gerar número
    const countResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(inventoryCounts)
      .where(eq(inventoryCounts.tenantId, tenantId));
    const number = `INV-${String(Number(countResult[0].count) + 1).padStart(5, '0')}`;

    const result = await this.db.insert(inventoryCounts).values({
      tenantId,
      number,
      warehouseId: data.warehouseId,
      status: 'counting',
      type: data.type || 'full',
      blindCount: data.blindCount ?? true,
      notes: data.notes ?? null,
      userId,
    }).returning();

    const count = result[0];

    // Preencher itens com base nos produtos que têm saldo neste depósito
    if (data.type === 'full' || !data.productIds?.length) {
      // Contagem completa: todos os produtos do depósito
      const levels = await this.db.select({
        productId: stockLevels.productId,
        quantity: stockLevels.quantity,
      }).from(stockLevels)
        .where(and(
          eq(stockLevels.tenantId, tenantId),
          eq(stockLevels.warehouseId, data.warehouseId),
        ));

      // Também incluir produtos sem saldo mas ativos (para contagem completa)
      const activeProducts = await this.db.select({
        productId: products.id,
      }).from(products)
        .where(and(
          eq(products.tenantId, tenantId),
          eq(products.status, 'active'),
        ));

      // Mesclar: produtos com saldo + ativos sem saldo
      const productMap = new Map<string, string>();
      for (const l of levels) {
        productMap.set(l.productId, l.quantity);
      }
      for (const p of activeProducts) {
        if (!productMap.has(p.productId)) {
          productMap.set(p.productId, '0');
        }
      }

      if (productMap.size > 0) {
        await this.db.insert(inventoryCountItems).values(
          Array.from(productMap.entries()).map(([productId, qty]) => ({
            countId: count.id,
            productId,
            systemQuantity: qty,
            status: 'pending' as const,
          }))
        );
      }
    } else {
      // Contagem parcial: apenas os produtos selecionados
      const levels = await this.db.select({
        productId: stockLevels.productId,
        quantity: stockLevels.quantity,
      }).from(stockLevels)
        .where(and(
          eq(stockLevels.tenantId, tenantId),
          eq(stockLevels.warehouseId, data.warehouseId),
        ));

      const levelMap = new Map(levels.map(l => [l.productId, l.quantity]));

      await this.db.insert(inventoryCountItems).values(
        data.productIds.map((productId) => ({
          countId: count.id,
          productId,
          systemQuantity: levelMap.get(productId) ?? '0',
          status: 'pending' as const,
        }))
      );
    }

    return this.getById(count.id, tenantId) as Promise<InventoryCount>;
  }

  async registerItem(countId: string, userId: string, data: RegisterCountItemDTO): Promise<void> {
    // Buscar item existente
    const existing = await this.db.select().from(inventoryCountItems)
      .where(and(
        eq(inventoryCountItems.countId, countId),
        eq(inventoryCountItems.productId, data.productId),
      ))
      .limit(1);

    if (!existing[0]) {
      throw new Error(`Product ${data.productId} not found in this count`);
    }

    const systemQty = Number(existing[0].systemQuantity);
    const countedQty = data.countedQuantity;
    const difference = countedQty - systemQty;

    await this.db.update(inventoryCountItems).set({
      countedQuantity: String(countedQty),
      difference: String(difference),
      status: 'counted',
      notes: data.notes ?? null,
      countedBy: userId,
      countedAt: new Date(),
    }).where(eq(inventoryCountItems.id, existing[0].id));
  }

  async approve(id: string, tenantId: string, userId: string): Promise<InventoryCount> {
    // Verificar se todos os itens foram contados
    const pendingItems = await this.db.select({ count: sql<number>`count(*)` })
      .from(inventoryCountItems)
      .where(and(
        eq(inventoryCountItems.countId, id),
        eq(inventoryCountItems.status, 'pending'),
      ));

    if (Number(pendingItems[0].count) > 0) {
      throw new Error(`There are ${pendingItems[0].count} items not yet counted`);
    }

    // Aprovar o inventário
    await this.db.update(inventoryCounts).set({
      status: 'approved',
      approvedBy: userId,
      approvedAt: new Date(),
    }).where(and(eq(inventoryCounts.id, id), eq(inventoryCounts.tenantId, tenantId)));

    // Marcar itens como adjusted
    await this.db.update(inventoryCountItems).set({
      status: 'adjusted',
    }).where(and(
      eq(inventoryCountItems.countId, id),
      eq(inventoryCountItems.status, 'counted'),
    ));

    return this.getById(id, tenantId) as Promise<InventoryCount>;
  }
}
