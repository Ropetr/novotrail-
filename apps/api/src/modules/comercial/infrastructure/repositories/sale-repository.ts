import { eq, and, or, like, sql } from 'drizzle-orm';
import type {
  ISaleRepository,
  ListResult,
  SaleWithItems,
} from '../../domain/repositories';
import type {
  Sale,
  CreateSaleDTO,
  UpdateSaleDTO,
} from '../../domain/entities';
import type { DatabaseConnection } from '../../../../shared/database/connection';
import type { PaginationInput } from '@trailsystem/types';
import { sales, saleItems } from '../schema';

export class SaleRepository implements ISaleRepository {
  constructor(private db: DatabaseConnection) {}

  async list(tenantId: string, params: PaginationInput): Promise<ListResult<Sale>> {
    const { page, limit, search } = params;
    const offset = (page - 1) * limit;

    const baseWhere = eq(sales.tenantId, tenantId);

    const whereClause = search
      ? and(baseWhere, or(like(sales.number, `%${search}%`)))
      : baseWhere;

    const [data, countResult] = await Promise.all([
      this.db.select().from(sales).where(whereClause).limit(limit).offset(offset),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(sales)
        .where(whereClause),
    ]);

    return {
      data: data as unknown as Sale[],
      total: Number(countResult[0].count),
    };
  }

  async getById(id: string, tenantId: string): Promise<SaleWithItems | null> {
    const saleResult = await this.db
      .select()
      .from(sales)
      .where(and(eq(sales.id, id), eq(sales.tenantId, tenantId)))
      .limit(1);

    if (!saleResult[0]) return null;

    const items = await this.db
      .select()
      .from(saleItems)
      .where(eq(saleItems.saleId, id));

    return {
      ...(saleResult[0] as unknown as Sale),
      items: items as any[],
    };
  }

  async create(tenantId: string, data: CreateSaleDTO): Promise<SaleWithItems> {
    const countResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(sales)
      .where(eq(sales.tenantId, tenantId));

    const number = `VEN-${String(Number(countResult[0].count) + 1).padStart(4, '0')}`;

    // Calculate totals from items
    const subtotal = data.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity - (item.discount || 0),
      0
    );
    const discount = data.discount || 0;
    const total = subtotal - discount;

    const saleId = crypto.randomUUID();

    const newSale = {
      id: saleId,
      tenantId,
      number,
      quoteId: data.quoteId ?? null,
      clientId: data.clientId,
      sellerId: data.sellerId ?? null,
      date: new Date(data.date),
      status: 'pending' as const,
      subtotal,
      discount,
      total,
      paymentMethod: data.paymentMethod ?? null,
      notes: data.notes ?? null,
      parentSaleId: null,
      splitFrom: null,
      financialType: data.financialType ?? ('integral' as const),
      invoicedAmount: 0,
      deliveredAmount: 0,
      receivedAmount: 0,
      creditUsed: data.creditUsed ?? 0,
      creditReservedForDeliveries: data.creditReservedForDeliveries ?? false,
      internalNotes: data.internalNotes ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.db.insert(sales).values(newSale as any);

    // Insert items
    const itemRecords = data.items.map((item, idx) => ({
      id: crypto.randomUUID(),
      saleId,
      productId: item.productId,
      sequence: idx + 1,
      quantity: item.quantity,
      quantityInvoiced: 0,
      quantityDelivered: 0,
      unitPrice: item.unitPrice,
      discount: item.discount || 0,
      total: item.unitPrice * item.quantity - (item.discount || 0),
    }));

    if (itemRecords.length > 0) {
      await this.db.insert(saleItems).values(itemRecords as any);
    }

    return {
      ...(newSale as unknown as Sale),
      items: itemRecords as any[],
    };
  }

  async update(id: string, tenantId: string, data: UpdateSaleDTO): Promise<SaleWithItems> {
    const updateData: any = { updatedAt: new Date() };

    if (data.clientId !== undefined) updateData.clientId = data.clientId;
    if (data.sellerId !== undefined) updateData.sellerId = data.sellerId;
    if (data.date !== undefined) updateData.date = new Date(data.date);
    if (data.discount !== undefined) updateData.discount = data.discount;
    if (data.paymentMethod !== undefined) updateData.paymentMethod = data.paymentMethod;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes;

    await this.db
      .update(sales)
      .set(updateData)
      .where(and(eq(sales.id, id), eq(sales.tenantId, tenantId)));

    const updated = await this.getById(id, tenantId);
    if (!updated) throw new Error('Sale not found after update');

    return updated;
  }

  async cancel(id: string, tenantId: string): Promise<Sale> {
    await this.db
      .update(sales)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(and(eq(sales.id, id), eq(sales.tenantId, tenantId)));

    const updated = await this.db
      .select()
      .from(sales)
      .where(and(eq(sales.id, id), eq(sales.tenantId, tenantId)))
      .limit(1);

    if (!updated[0]) throw new Error('Sale not found after cancellation');

    return updated[0] as unknown as Sale;
  }
}
