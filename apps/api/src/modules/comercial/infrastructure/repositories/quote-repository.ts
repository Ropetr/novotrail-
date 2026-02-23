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
  MergeQuotesDTO,
  SplitQuoteDTO,
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
      data: data as unknown as Quote[],
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
      ...(quoteResult[0] as unknown as Quote),
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
      date: new Date(data.date),
      validUntil: data.validUntil ? new Date(data.validUntil) : null,
      status: 'draft' as const,
      subtotal,
      discount,
      total,
      notes: data.notes ?? null,
      parentQuoteId: null,
      mergedFrom: null,
      version: 1,
      internalNotes: data.internalNotes ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.db.insert(quotes).values(newQuote as any);

    // Insert items
    const itemRecords = data.items.map((item, idx) => ({
      id: crypto.randomUUID(),
      quoteId,
      productId: item.productId,
      sequence: idx + 1,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discount: item.discount || 0,
      total: item.unitPrice * item.quantity - (item.discount || 0),
      notes: item.notes ?? null,
    }));

    if (itemRecords.length > 0) {
      await this.db.insert(quoteItems).values(itemRecords as any);
    }

    return {
      ...(newQuote as unknown as Quote),
      items: itemRecords as any[],
    };
  }

  async update(id: string, tenantId: string, data: UpdateQuoteDTO): Promise<QuoteWithItems> {
    const updateData: any = { updatedAt: new Date() };

    if (data.clientId !== undefined) updateData.clientId = data.clientId;
    if (data.sellerId !== undefined) updateData.sellerId = data.sellerId;
    if (data.date !== undefined) updateData.date = new Date(data.date);
    if (data.validUntil !== undefined) updateData.validUntil = data.validUntil ? new Date(data.validUntil) : null;
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

      const itemRecords = data.items.map((item, idx) => ({
        id: crypto.randomUUID(),
        quoteId: id,
        productId: item.productId,
        sequence: idx + 1,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount || 0,
        total: item.unitPrice * item.quantity - (item.discount || 0),
        notes: item.notes ?? null,
      }));

      if (itemRecords.length > 0) {
        await this.db.insert(quoteItems).values(itemRecords as any);
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

    return updated[0] as unknown as Quote;
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
      date: typeof quote.date === 'string' ? new Date(quote.date) : quote.date,
      status: 'pending' as const,
      subtotal: quote.subtotal,
      discount: quote.discount,
      total: quote.total,
      paymentMethod: null,
      notes: quote.notes ?? null,
      parentSaleId: null,
      splitFrom: null,
      financialType: 'integral' as const,
      invoicedAmount: 0,
      deliveredAmount: 0,
      receivedAmount: 0,
      creditUsed: 0,
      creditReservedForDeliveries: false,
      internalNotes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.db.insert(sales).values(newSale as any);

    // Copy quote items to sale items
    const saleItemRecords = quote.items.map((item: any, idx: number) => ({
      id: crypto.randomUUID(),
      saleId,
      productId: item.productId,
      sequence: idx + 1,
      quantity: item.quantity,
      quantityInvoiced: 0,
      quantityDelivered: 0,
      unitPrice: item.unitPrice,
      discount: item.discount || 0,
      total: item.total,
    }));

    if (saleItemRecords.length > 0) {
      await this.db.insert(saleItems).values(saleItemRecords as any);
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

  async merge(tenantId: string, data: MergeQuotesDTO): Promise<QuoteWithItems> {
    // Fetch all source quotes and their items
    const sourceQuotes: QuoteWithItems[] = [];
    for (const qId of data.quoteIds) {
      const q = await this.getById(qId, tenantId);
      if (!q) throw new Error(`Quote ${qId} not found`);
      sourceQuotes.push(q);
    }

    // Collect all items, handling duplicates by price rule
    const itemMap = new Map<string, any>();
    for (const q of sourceQuotes) {
      for (const item of q.items) {
        const existing = itemMap.get(item.productId);
        if (!existing) {
          itemMap.set(item.productId, { ...item });
        } else {
          // Duplicate product: apply rule
          existing.quantity += item.quantity;
          if (data.duplicatePriceRule === 'lowest') {
            existing.unitPrice = Math.min(Number(existing.unitPrice), Number(item.unitPrice));
          } else if (data.duplicatePriceRule === 'highest') {
            existing.unitPrice = Math.max(Number(existing.unitPrice), Number(item.unitPrice));
          } else if (data.duplicatePriceRule === 'latest') {
            existing.unitPrice = Number(item.unitPrice);
          }
          existing.total = existing.unitPrice * existing.quantity - (existing.discount || 0);
        }
      }
    }

    // Create merged quote
    const mergedItems = Array.from(itemMap.values()).map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      discount: Number(item.discount || 0),
      notes: item.notes,
    }));

    const merged = await this.create(tenantId, {
      clientId: data.mainClientId,
      date: new Date().toISOString(),
      items: mergedItems,
    });

    // Update merged quote with reference to sources
    await this.db
      .update(quotes)
      .set({
        mergedFrom: JSON.stringify(data.quoteIds),
        updatedAt: new Date(),
      })
      .where(eq(quotes.id, merged.id));

    // Mark source quotes as expired
    for (const qId of data.quoteIds) {
      await this.db
        .update(quotes)
        .set({ status: 'expired', updatedAt: new Date() })
        .where(eq(quotes.id, qId));
    }

    return (await this.getById(merged.id, tenantId))!;
  }

  async split(id: string, tenantId: string, data: SplitQuoteDTO): Promise<QuoteWithItems[]> {
    const source = await this.getById(id, tenantId);
    if (!source) throw new Error('Quote not found');

    const selectedItems = source.items.filter(item => data.itemIds.includes(item.id));
    const remainingItems = source.items.filter(item => !data.itemIds.includes(item.id));

    if (selectedItems.length === 0) throw new Error('No items selected');
    if (remainingItems.length === 0) throw new Error('Cannot split all items');

    // Create child quote with selected items
    const childQuote = await this.create(tenantId, {
      clientId: source.clientId,
      sellerId: source.sellerId,
      date: new Date().toISOString(),
      notes: source.notes,
      items: selectedItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        discount: Number(item.discount || 0),
        notes: item.notes,
      })),
    });

    // Set parent reference on child
    await this.db
      .update(quotes)
      .set({ parentQuoteId: id, updatedAt: new Date() })
      .where(eq(quotes.id, childQuote.id));

    // Update original - remove selected items, recalculate
    await this.update(id, tenantId, {
      items: remainingItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        discount: Number(item.discount || 0),
        notes: item.notes,
      })),
    });

    const updatedSource = (await this.getById(id, tenantId))!;
    const updatedChild = (await this.getById(childQuote.id, tenantId))!;

    return [updatedSource, updatedChild];
  }
}
