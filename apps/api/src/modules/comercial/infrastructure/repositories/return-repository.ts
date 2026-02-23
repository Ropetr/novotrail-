import { eq, and, or, like, sql } from 'drizzle-orm';
import type {
  IReturnRepository,
  ListResult,
  ReturnWithItems,
} from '../../domain/repositories';
import type {
  Return,
  CreateReturnDTO,
  UpdateReturnDTO,
} from '../../domain/entities';
import type { DatabaseConnection } from '../../../../shared/database/connection';
import type { PaginationInput } from '@trailsystem/types';
import { returns, returnItems } from '../schema';

export class ReturnRepository implements IReturnRepository {
  constructor(private db: DatabaseConnection) {}

  async list(tenantId: string, params: PaginationInput): Promise<ListResult<Return>> {
    const { page, limit, search } = params;
    const offset = (page - 1) * limit;

    const baseWhere = eq(returns.tenantId, tenantId);

    const whereClause = search
      ? and(baseWhere, or(like(returns.number, `%${search}%`)))
      : baseWhere;

    const [data, countResult] = await Promise.all([
      this.db.select().from(returns).where(whereClause).limit(limit).offset(offset),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(returns)
        .where(whereClause),
    ]);

    return {
      data: data as unknown as Return[],
      total: Number(countResult[0].count),
    };
  }

  async getById(id: string, tenantId: string): Promise<ReturnWithItems | null> {
    const returnResult = await this.db
      .select()
      .from(returns)
      .where(and(eq(returns.id, id), eq(returns.tenantId, tenantId)))
      .limit(1);

    if (!returnResult[0]) return null;

    const items = await this.db
      .select()
      .from(returnItems)
      .where(eq(returnItems.returnId, id));

    return {
      ...(returnResult[0] as unknown as Return),
      items: items as any[],
    };
  }

  async create(tenantId: string, data: CreateReturnDTO): Promise<ReturnWithItems> {
    const countResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(returns)
      .where(eq(returns.tenantId, tenantId));

    const number = `DEV-${String(Number(countResult[0].count) + 1).padStart(4, '0')}`;

    // Calculate totals from items
    const subtotal = data.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );
    const total = subtotal;

    const returnId = crypto.randomUUID();

    const newReturn = {
      id: returnId,
      tenantId,
      number,
      saleId: data.saleId,
      clientId: data.clientId,
      date: new Date(data.date),
      status: 'pending' as const,
      reason: data.reason ?? null,
      refundType: data.refundType ?? null,
      creditGeneratedId: null,
      subtotal,
      total,
      notes: data.notes ?? null,
      approvedBy: null,
      approvedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.db.insert(returns).values(newReturn as any);

    // Insert items
    const itemRecords = data.items.map((item) => ({
      id: crypto.randomUUID(),
      returnId,
      saleItemId: item.saleItemId ?? null,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.unitPrice * item.quantity,
      reason: item.reason ?? null,
      productCondition: item.productCondition ?? null,
    }));

    if (itemRecords.length > 0) {
      await this.db.insert(returnItems).values(itemRecords as any);
    }

    return {
      ...(newReturn as unknown as Return),
      items: itemRecords as any[],
    };
  }

  async update(id: string, tenantId: string, data: UpdateReturnDTO): Promise<ReturnWithItems> {
    const updateData: any = { updatedAt: new Date() };

    if (data.reason !== undefined) updateData.reason = data.reason;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes;

    await this.db
      .update(returns)
      .set(updateData)
      .where(and(eq(returns.id, id), eq(returns.tenantId, tenantId)));

    const updated = await this.getById(id, tenantId);
    if (!updated) throw new Error('Return not found after update');

    return updated;
  }

  async approve(id: string, tenantId: string): Promise<Return> {
    await this.db
      .update(returns)
      .set({ status: 'approved', updatedAt: new Date() })
      .where(and(eq(returns.id, id), eq(returns.tenantId, tenantId)));

    const updated = await this.db
      .select()
      .from(returns)
      .where(and(eq(returns.id, id), eq(returns.tenantId, tenantId)))
      .limit(1);

    if (!updated[0]) throw new Error('Return not found after approval');

    return updated[0] as unknown as Return;
  }
}
