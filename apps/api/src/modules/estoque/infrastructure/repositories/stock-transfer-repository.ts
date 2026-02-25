import { eq, and, sql, desc } from 'drizzle-orm';
import type { IStockTransferRepository, ListResult, PaginationInput } from '../../domain/repositories';
import type { StockTransfer, CreateTransferDTO } from '../../domain/entities';
import type { DatabaseConnection } from '../../../../shared/database/connection';
import { stockTransfers, stockTransferItems } from '../schema';

export class StockTransferRepository implements IStockTransferRepository {
  constructor(private db: DatabaseConnection) {}

  async list(tenantId: string, params: PaginationInput & {
    status?: string;
  }): Promise<ListResult<StockTransfer>> {
    const { page, limit, status } = params;
    const offset = (page - 1) * limit;

    const conditions: any[] = [eq(stockTransfers.tenantId, tenantId)];
    if (status) conditions.push(eq(stockTransfers.status, status as any));

    const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions);

    const [data, countResult] = await Promise.all([
      this.db.select().from(stockTransfers)
        .where(whereClause)
        .orderBy(desc(stockTransfers.createdAt))
        .limit(limit).offset(offset),
      this.db.select({ count: sql<number>`count(*)` })
        .from(stockTransfers).where(whereClause),
    ]);

    return { data: data as unknown as StockTransfer[], total: Number(countResult[0].count) };
  }

  async getById(id: string, tenantId: string): Promise<StockTransfer | null> {
    const result = await this.db.select().from(stockTransfers)
      .where(and(eq(stockTransfers.id, id), eq(stockTransfers.tenantId, tenantId)))
      .limit(1);

    if (!result[0]) return null;

    // Buscar itens da transferência
    const items = await this.db.select().from(stockTransferItems)
      .where(eq(stockTransferItems.transferId, id));

    return {
      ...(result[0] as any),
      items,
    } as unknown as StockTransfer;
  }

  async create(tenantId: string, userId: string, data: CreateTransferDTO): Promise<StockTransfer> {
    // Gerar número sequencial
    const countResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(stockTransfers)
      .where(eq(stockTransfers.tenantId, tenantId));
    const number = `TRF-${String(Number(countResult[0].count) + 1).padStart(5, '0')}`;

    const result = await this.db.insert(stockTransfers).values({
      tenantId,
      number,
      fromWarehouseId: data.fromWarehouseId,
      toWarehouseId: data.toWarehouseId,
      status: 'draft',
      notes: data.notes ?? null,
      userId,
    }).returning();

    const transfer = result[0];

    // Inserir itens
    if (data.items?.length) {
      await this.db.insert(stockTransferItems).values(
        data.items.map((item) => ({
          transferId: transfer.id,
          productId: item.productId,
          quantity: String(item.quantity),
          unitCost: String(item.unitCost ?? 0),
        }))
      );
    }

    return this.getById(transfer.id, tenantId) as Promise<StockTransfer>;
  }

  async updateStatus(id: string, tenantId: string, status: string, extra?: Record<string, any>): Promise<StockTransfer> {
    const updates: any = { status };
    if (status === 'in_transit') updates.shippedAt = new Date();
    if (status === 'received') updates.receivedAt = new Date();
    if (extra) Object.assign(updates, extra);

    await this.db.update(stockTransfers)
      .set(updates)
      .where(and(eq(stockTransfers.id, id), eq(stockTransfers.tenantId, tenantId)));

    return this.getById(id, tenantId) as Promise<StockTransfer>;
  }
}
