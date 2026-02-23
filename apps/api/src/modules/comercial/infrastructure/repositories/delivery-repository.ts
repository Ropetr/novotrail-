import { eq, sql } from 'drizzle-orm';
import type {
  IDeliveryRepository,
} from '../../domain/repositories';
import type {
  SaleDelivery,
  CreateDeliveryDTO,
} from '../../domain/entities';
import type { DatabaseConnection } from '../../../../shared/database/connection';
import { saleDeliveries, saleDeliveryItems, saleItems } from '../schema';

export class DeliveryRepository implements IDeliveryRepository {
  constructor(private db: DatabaseConnection) {}

  async listBySale(saleId: string): Promise<SaleDelivery[]> {
    const data = await this.db
      .select()
      .from(saleDeliveries)
      .where(eq(saleDeliveries.saleId, saleId))
      .orderBy(saleDeliveries.sequence);

    return data as unknown as SaleDelivery[];
  }

  async getById(id: string): Promise<SaleDelivery | null> {
    const result = await this.db
      .select()
      .from(saleDeliveries)
      .where(eq(saleDeliveries.id, id))
      .limit(1);

    if (!result[0]) return null;

    const items = await this.db
      .select()
      .from(saleDeliveryItems)
      .where(eq(saleDeliveryItems.deliveryId, id));

    return {
      ...(result[0] as unknown as SaleDelivery),
      items: items as any[],
    };
  }

  async create(tenantId: string, data: CreateDeliveryDTO): Promise<SaleDelivery> {
    // Count existing deliveries for numbering .E1, .E2, etc.
    const countResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(saleDeliveries)
      .where(eq(saleDeliveries.saleId, data.saleId));

    const seq = Number(countResult[0].count) + 1;
    const number = `.E${seq}`;
    const deliveryId = crypto.randomUUID();

    // Calculate product amount from items
    let productAmount = 0;
    for (const item of data.items) {
      const saleItem = await this.db
        .select()
        .from(saleItems)
        .where(eq(saleItems.id, item.saleItemId))
        .limit(1);

      if (saleItem[0]) {
        productAmount += item.quantity * Number(saleItem[0].unitPrice);
      }
    }

    const freightAmount = data.freightAmount || 0;
    const totalAmount = productAmount + freightAmount;

    const newDelivery = {
      id: deliveryId,
      saleId: data.saleId,
      number,
      sequence: seq,
      status: 'pending' as const,
      deliveryType: data.deliveryType || ('delivery' as const),
      scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : null,
      productAmount,
      freightAmount,
      totalAmount,
      paymentMethod: data.paymentMethod ?? null,
      notes: data.notes ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.db.insert(saleDeliveries).values(newDelivery as any);

    // Insert delivery items
    const itemRecords = data.items.map((item) => ({
      id: crypto.randomUUID(),
      deliveryId,
      saleItemId: item.saleItemId,
      productId: item.productId,
      quantity: item.quantity,
      quantitySeparated: 0,
      quantityDelivered: 0,
      createdAt: new Date(),
    }));

    if (itemRecords.length > 0) {
      await this.db.insert(saleDeliveryItems).values(itemRecords as any);
    }

    return { ...newDelivery, items: itemRecords } as any;
  }

  async startSeparation(id: string): Promise<SaleDelivery> {
    await this.db
      .update(saleDeliveries)
      .set({ status: 'separating', separatedAt: null, updatedAt: new Date() })
      .where(eq(saleDeliveries.id, id));

    const result = await this.getById(id);
    if (!result) throw new Error('Delivery not found after update');
    return result;
  }

  async confirmSeparation(id: string): Promise<SaleDelivery> {
    // Set all items quantity_separated = quantity
    await this.db
      .update(saleDeliveryItems)
      .set({ quantitySeparated: sql`${saleDeliveryItems.quantity}` })
      .where(eq(saleDeliveryItems.deliveryId, id));

    await this.db
      .update(saleDeliveries)
      .set({ status: 'separated', separatedAt: new Date(), updatedAt: new Date() })
      .where(eq(saleDeliveries.id, id));

    const result = await this.getById(id);
    if (!result) throw new Error('Delivery not found after update');
    return result;
  }

  async confirmDelivery(id: string, receiverName: string, receiverDocument?: string): Promise<SaleDelivery> {
    // Set all items quantity_delivered = quantity_separated
    await this.db
      .update(saleDeliveryItems)
      .set({ quantityDelivered: sql`${saleDeliveryItems.quantitySeparated}` })
      .where(eq(saleDeliveryItems.deliveryId, id));

    await this.db
      .update(saleDeliveries)
      .set({
        status: 'delivered',
        deliveredAt: new Date(),
        receiverName,
        receiverDocument: receiverDocument ?? null,
        updatedAt: new Date(),
      })
      .where(eq(saleDeliveries.id, id));

    const result = await this.getById(id);
    if (!result) throw new Error('Delivery not found after update');
    return result;
  }

  async cancel(id: string): Promise<SaleDelivery> {
    await this.db
      .update(saleDeliveries)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(eq(saleDeliveries.id, id));

    const result = await this.getById(id);
    if (!result) throw new Error('Delivery not found after cancellation');
    return result;
  }
}
