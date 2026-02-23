import { eq, and, or, like, sql } from 'drizzle-orm';
import type {
  IQuoteRepository,
  ListResult,
  QuoteWithItems,
} from '../../domain/repositories';
import type {
  Quote,
  Sale,
  CreateQuoteDTO,
  UpdateQuoteDTO,
} from '../../domain/entities';
import type { DatabaseConnection } from '../../../../shared/database/connection';
import type { PaginationInput } from '@trailsystem/types';
import { quotes, quoteItems, sales, saleItems } from '../schema';

export class QuoteRepository implements IQuoteRepository {
  constructor(private db: DatabaseConnection) {}

  async list(tenantId: string, params: PaginationInput): Promise<ListResult<Quote>> {
    const { page, limit, search } = params;
    const offset = (page - 1) * limit;

    const baseWhere = eq(quotes.tenantId, tenantId);

    const whereClause = search
      ? and(baseWhere, or(like(quotes.number, `%${search}%`)))
      : baseWhere;

    const [data, countResult] = await Promise.all([
      this.db.select().from(quotes).where(whereClause).limit(limit).offset(offset),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(quotes)
        .where(whereClause),
    ]);

    return {
      data: data as Quote[],
      total: Number(countResult[0].count),
    };
  }

  async getById(id: string, tenantId: string): Promise<QuoteWithItems | null> {
    const quoteResult = await this.db
      .select()
      .from(quotes)
      .where(and(eq(quotes.id, id), eq(quotes.tenantId, tenantId)))
      .limit(1);

    if (!quoteResult[0]) return null;

    const items = await this.db
      .select()
      .from(quoteItems)
      .where(eq(quoteItems.quoteId, id));

    return {
      ...(quoteResult[0] as Quote),
      items: items as any[],
    };
  }

  async create(tenantId: string, data: CreateQuoteDTO): Promise<QuoteWithItems> {
    const countResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(quotes)
      .where(eq(quotes.tenantId, tenantId));

    const number = `ORC-${String(Number(countResult[0].count) + 1).padStart(4, '0')}`;

    // Calculate totals from items
    const subtotal = data.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity - (item.discount || 0),
      0
    );
    const discount = data.discount || 0;
    const total = subtotal - discount;

    const quoteId = crypto.randomUUID();

    const newQuote = {
      id: quoteId,
      tenantId,
      number,
      clientId: data.clientId,
      sellerId: data.sellerId ?? null,
      date: data.date,
      validUntil: data.validUntil ?? null,
      status: 'draft' as const,
      subtotal,
      discount,
      total,
      notes: data.notes ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.db.insert(quotes).values(newQuote);

    // Insert items
    const itemRecords = data.items.map((item) => ({
      id: crypto.randomUUID(),
      quoteId,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discount: item.discount || 0,
      total: item.unitPrice * item.quantity - (item.discount || 0),
      notes: item.notes ?? null,
    }));

    if (itemRecords.length > 0) {
      await this.db.insert(quoteItems).values(itemRecords);
    }

    return {
      ...(newQuote as Quote),
      items: itemRecords as any[],
    };
  }

  async update(id: string, tenantId: string, data: UpdateQuoteDTO): Promise<QuoteWithItems> {
    const updateData: any = { updatedAt: new Date() };

    if (data.clientId !== undefined) updateData.clientId = data.clientId;
    if (data.sellerId !== undefined) updateData.sellerId = data.sellerId;
    if (data.date !== undefined) updateData.date = data.date;
    if (data.validUntil !== undefined) updateData.validUntil = data.validUntil;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes;

    // Recalculate totals if items provided
    if (data.items) {
      const subtotal = data.items.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity - (item.discount || 0),
        0
      );
      const discount = data.discount !== undefined ? data.discount : 0;
      updateData.subtotal = subtotal;
      updateData.discount = discount;
      updateData.total = subtotal - discount;

      // Replace items
      await this.db.delete(quoteItems).where(eq(quoteItems.quoteId, id));

      const itemRecords = data.items.map((item) => ({
        id: crypto.randomUUID(),
        quoteId: id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount || 0,
        total: item.unitPrice * item.quantity - (item.discount || 0),
        notes: item.notes ?? null,
      }));

      if (itemRecords.length > 0) {
        await this.db.insert(quoteItems).values(itemRecords);
      }
    } else if (data.discount !== undefined) {
      updateData.discount = data.discount;
    }

    await this.db
      .update(quotes)
      .set(updateData)
      .where(and(eq(quotes.id, id), eq(quotes.tenantId, tenantId)));

    const updated = await this.getById(id, tenantId);
    if (!updated) throw new Error('Quote not found after update');

    return updated;
  }

  async approve(id: string, tenantId: string): Promise<Quote> {
    await this.db
      .update(quotes)
      .set({ status: 'approved', updatedAt: new Date() })
      .where(and(eq(quotes.id, id), eq(quotes.tenantId, tenantId)));

    const updated = await this.db
      .select()
      .from(quotes)
      .where(and(eq(quotes.id, id), eq(quotes.tenantId, tenantId)))
      .limit(1);

    if (!updated[0]) throw new Error('Quote not found after approval');

    return updated[0] as Quote;
  }

  async convertToSale(id: string, tenantId: string): Promise<Sale> {
    const quote = await this.getById(id, tenantId);
    if (!quote) throw new Error('Quote not found');
    if (quote.status !== 'approved') throw new Error('Quote must be approved before converting to sale');

    const countResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(sales)
      .where(eq(sales.tenantId, tenantId));

    const saleNumber = `VEN-${String(Number(countResult[0].count) + 1).padStart(4, '0')}`;
    const saleId = crypto.randomUUID();

    const newSale = {
      id: saleId,
      tenantId,
      number: saleNumber,
      quoteId: id,
      clientId: quote.clientId,
      sellerId: quote.sellerId ?? null,
      date: quote.date,
      status: 'pending' as const,
      subtotal: quote.subtotal,
      discount: quote.discount,
      total: quote.total,
      paymentMethod: null,
      notes: quote.notes ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.db.insert(sales).values(newSale);

    // Copy quote items to sale items
    const saleItemRecords = quote.items.map((item: any) => ({
      id: crypto.randomUUID(),
      saleId,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discount: item.discount || 0,
      total: item.total,
    }));

    if (saleItemRecords.length > 0) {
      await this.db.insert(saleItems).values(saleItemRecords);
    }

    // Mark quote as converted (rejected status reused to indicate conversion)
    await this.db
      .update(quotes)
      .set({ status: 'approved', updatedAt: new Date() })
      .where(eq(quotes.id, id));

    return newSale as unknown as Sale;
  }

  async softDelete(id: string, tenantId: string): Promise<void> {
    await this.db
      .update(quotes)
      .set({ status: 'rejected', updatedAt: new Date() })
      .where(and(eq(quotes.id, id), eq(quotes.tenantId, tenantId)));
  }
}
